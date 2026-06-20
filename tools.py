from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from rich import print
from dotenv import load_dotenv
load_dotenv()

tavily=TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query:str)-> str:
    """search the web for a query and return the recent and reliable informations. Return title and link of the top 3 results."""
    response = tavily.search(query=query, max_results=3)
    
    out=[]

    for r in response['results']:
        out.append(f"Title:{r['title']}\nLink:{r['url']}\nsnippet:{r['content'][:200]}\n")
    return "\n----\n".join(out)
    


@tool
def web_scrape(url:str)-> str:
    """scrape the web page and return the text content of the page."""
    try: 
        response = requests.get(url,timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(response.content, 'html.parser')
        for tag in soup(['script', 'style',"nav", "footer", "aside"]):
            tag.decompose()
        return soup.get_text(separator=' ', strip=True)[:2000]
    except Exception as e:
        return f"Error scraping the page: {e}"
    
