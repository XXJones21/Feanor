from fastapi import FastAPI, Request, HTTPException
import httpx
import json
import logging
import asyncio
import time
import sys
import os

# Add the project root to Python path to allow imports from Tools directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from Tools.tool_handlers import TOOL_HANDLERS

from fastapi.responses import JSONResponse, StreamingResponse
from typing import AsyncGenerator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Load tool configurations
with open('Tools/tools_config.json', 'r') as f:
    TOOLS_CONFIG = json.load(f)

LMSTUDIO_URL = "http://localhost:4891/v1/chat/completions"

async def check_lmstudio():
    """Check if LM Studio is running and responding"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:4891/v1/models")
            if response.status_code == 200:
                return True
            return False
    except:
        return False

async def stream_response(response: httpx.Response) -> AsyncGenerator[bytes, None]:
    """Stream the response from LM Studio"""
    async for chunk in response.aiter_bytes():
        yield chunk

@app.post("/v1/chat/completions")
async def proxy_completion(request: Request):
    try:
        body = await request.json()
        logger.info(f"Received request body: {json.dumps(body, indent=2)}")
        
        # Check if streaming is requested
        is_streaming = body.get('stream', False)
        
        # For other requests, forward to LM Studio
        async with httpx.AsyncClient() as client:
            # Ensure we're passing stream=true to LM Studio when requested
            if is_streaming:
                body['stream'] = True  # Explicitly set stream to True
                
            response = await client.post(
                LMSTUDIO_URL, 
                json=body,
                timeout=30.0,
                headers={
                    'Accept': 'text/event-stream' if is_streaming else 'application/json',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive' if is_streaming else 'close'
                }
            )
            
            # If streaming is requested, return a streaming response
            if is_streaming:
                return StreamingResponse(
                    stream_response(response),
                    media_type='text/event-stream'
                )
            
            # Otherwise return JSON response
            return response.json()
            
    except Exception as e:
        logger.exception("Error in proxy_completion")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/health')
async def health_check():
    try:
        lmstudio_connected = await check_lmstudio()
        return {
            "status": "healthy",
            "lmstudio_connected": lmstudio_connected
        }
    except Exception as e:
        logger.exception("Error in health check")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/functions/{function_name}")
async def execute_function(function_name: str, request: Request):
    try:
        if function_name in TOOL_HANDLERS:
            params = await request.json()
            logger.info(f"Executing function {function_name} with params: {params}")
            result = TOOL_HANDLERS[function_name](params)
            return {"result": result}
        return {"error": f"Function {function_name} not found"}
    except Exception as e:
        logger.error(f"Error in execute_function: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting proxy server on port 4892...")
    print("Tools available:", list(TOOL_HANDLERS.keys()))
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4892) 