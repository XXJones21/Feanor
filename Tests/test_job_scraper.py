import requests
import json
import sys

def test_job_scraper():
    url = "http://localhost:4892/v1/chat/completions"
    
    payload = {
        "model": "local-model",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful AI assistant. When analyzing job postings, extract key information like job title, requirements, responsibilities, and qualifications."
            },
            {
                "role": "user",
                "content": "Please scrape and analyze this NVIDIA job posting: https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite/job/US-CA-Santa-Clara/Gen-AI-Product-Evangelist-Engineer--Retail_JR1993613-1. Extract the job title, location, key responsibilities, and required qualifications."
            }
        ],
        "temperature": 0.2,
        "stream": False
    }
    
    try:
        print("Testing NVIDIA job posting scraper...")
        print(f"\nSending request to {url}")
        print(f"Target job URL: {payload['messages'][1]['content'].split(': ')[1]}")
        
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
                    print("\nExtracted Job Information:")
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

def check_services():
    """Check if both proxy and LM Studio are running"""
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

if __name__ == "__main__":
    print("Testing connection to services...")
    
    if not check_services():
        sys.exit(1)
        
    print("\nTesting job posting scraper...")
    success = test_job_scraper()
    print(f"\nTest {'succeeded' if success else 'failed'}")
    sys.exit(0 if success else 1) 