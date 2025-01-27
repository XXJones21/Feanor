import requests
import json

def test_web_scraper():
    url = "http://localhost:4892/v1/chat/completions"
    
    payload = {
        "model": "local-model",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful AI assistant. When asked to analyze web pages, use the scraping tools to fetch and summarize content."
            },
            {
                "role": "user",
                "content": "Please scrape and summarize the content from https://example.com"
            }
        ],
        "temperature": 0.2,
        "stream": False
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print("\nResponse:")
        print(json.dumps(response.json(), indent=2))
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_web_scraper() 