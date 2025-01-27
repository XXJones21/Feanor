import requests
import json
import sys
import time

def check_services():
    """Check if both proxy and LM Studio are running"""
    # Check proxy health
    try:
        health_response = requests.get("http://localhost:4892/health")
        health_data = health_response.json()
        
        print("Proxy Server Status:", health_data["status"])
        print("LM Studio Status:", health_data["lmstudio_status"])
        
        if health_data["lmstudio_status"] != "running":
            print("\nERROR: LM Studio is not running!")
            print("Please make sure LM Studio is running on port 4891")
            return False
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to proxy server!")
        print("Please make sure the proxy server is running on port 4892")
        return False

def test_proxy():
    url = "http://localhost:4892/v1/chat/completions"
    
    payload = {
        "model": "local-model",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful AI assistant. When you receive file contents from the tool, analyze them and provide a clear summary of the tools configured in the file."
            },
            {
                "role": "user",
                "content": "read_file tools_config.json and summarize what tools are configured"
            }
        ],
        "temperature": 0.2,
        "stream": False
    }
    
    try:
        print(f"\nSending request to {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                json_response = response.json()
                print("\nFull Response:")
                print(json.dumps(json_response, indent=2))
                
                if "error" in json_response:
                    print(f"\nError in response: {json_response['error']}")
                    return False
                
                if "choices" in json_response:
                    message = json_response["choices"][0]["message"]
                    print("\nResponse content:")
                    print(message.get("content", "No content"))
                    return True
                    
                print("\nUnexpected response format")
                return False
                
            except json.JSONDecodeError as e:
                print(f"\nError decoding response: {e}")
                print(f"Raw response: {response.text}")
                return False
        else:
            print(f"\nError: Received status code {response.status_code}")
            print(f"Response text: {response.text}")
            return False
            
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Testing connection to services...")
    
    if not check_services():
        sys.exit(1)
        
    print("\nTesting function calling...")
    success = test_proxy()
    print(f"\nTest {'succeeded' if success else 'failed'}")
    sys.exit(0 if success else 1) 