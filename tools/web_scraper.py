import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional
import logging
from urllib.parse import urlparse
import time

class WebScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def scrape_webpage(self, url: str, selector: Optional[str] = None) -> Dict:
        """
        Scrapes content from a webpage.
        
        Args:
            url (str): The URL to scrape
            selector (str, optional): CSS selector to target specific content
            
        Returns:
            Dict containing:
                - title: Page title
                - text: Main text content
                - links: List of links found
                - status: Success/failure status
                - timestamp: When the scrape occurred
        """
        try:
            # Validate URL
            parsed_url = urlparse(url)
            if not all([parsed_url.scheme, parsed_url.netloc]):
                return {
                    "status": "error",
                    "error": "Invalid URL format",
                    "timestamp": time.time()
                }
            
            # Make the request
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
                
            # Get content based on selector if provided
            if selector:
                content = soup.select(selector)
                text = "\n".join(element.get_text(strip=True) for element in content)
            else:
                # Get main content
                text = soup.get_text(separator='\n', strip=True)
            
            # Get links
            links = [
                {
                    "text": a.get_text(strip=True),
                    "href": a.get('href')
                }
                for a in soup.find_all('a', href=True)
            ]
            
            return {
                "title": soup.title.string if soup.title else None,
                "text": text,
                "links": links[:50],  # Limit number of links
                "status": "success",
                "url": url,
                "timestamp": time.time()
            }
            
        except requests.RequestException as e:
            return {
                "status": "error",
                "error": f"Request failed: {str(e)}",
                "timestamp": time.time()
            }
        except Exception as e:
            return {
                "status": "error",
                "error": f"Scraping failed: {str(e)}",
                "timestamp": time.time()
            }
            
    def extract_text(self, url: str) -> Dict:
        """
        Extracts just the main text content from a webpage.
        
        Args:
            url (str): The URL to scrape
            
        Returns:
            Dict containing:
                - text: Main text content
                - status: Success/failure status
        """
        result = self.scrape_webpage(url)
        if result["status"] == "success":
            return {
                "status": "success",
                "text": result["text"],
                "title": result["title"]
            }
        return result 