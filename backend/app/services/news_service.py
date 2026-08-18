import os
import time
import json
import logging
import urllib.request
import urllib.parse
from typing import List, Dict, Any
from dotenv import load_dotenv
from app.core.config import settings

# Load .env file explicitly if needed
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

logger = logging.getLogger("news_service")
logging.basicConfig(level=logging.INFO)

# In-memory cache for NewsData.io API responses
_news_cache: Dict[str, Any] = {
    "timestamp": 0,
    "articles": []
}

CACHE_DURATION_SECONDS = 1800  # 30 minutes cache duration

WILDLIFE_KEYWORDS = [
    "wildlife", "conservation", "species", "endangered", "biodiversity",
    "habitat", "iucn", "animal", "ecosystem", "nature", "tiger",
    "elephant", "rhino", "leopard", "bear", "bird", "forest", "marine",
    "trafficking", "poaching", "extinction", "sanctuary"
]

def is_wildlife_news(article: dict) -> bool:
    """
    Ensures that only genuine wildlife conservation news is retained.
    """
    text = (
        (article.get("title") or "") + " " +
        (article.get("description") or "") + " " +
        " ".join(article.get("keywords") or [])
    ).lower()
    
    return any(kw in text for kw in WILDLIFE_KEYWORDS)

def format_article(article: dict) -> dict:
    """
    Formats raw NewsData.io article into clean structure expected by frontend.
    """
    title = article.get("title") or "Wildlife Conservation Update"
    source = (article.get("source_id") or "Wildlife News").capitalize()
    description = article.get("description") or article.get("content") or "Latest update on wildlife conservation and endangered species."
    
    # Truncate description to 1-2 lines
    if len(description) > 180:
        description = description[:177] + "..."

    return {
        "title": title,
        "source": source,
        "description": description,
        "pubDate": article.get("pubDate") or "Recently",
        "link": article.get("link") or "#",
        "image_url": article.get("image_url")
    }

def fetch_wildlife_news() -> List[Dict[str, Any]]:
    """
    Fetches the latest 3 wildlife conservation news articles from NewsData.io.
    Implements 30-minute backend caching to minimize API credit consumption.
    Never crashes the backend.
    """
    global _news_cache
    current_time = time.time()

    # 1. Return cached data if cache is still valid (< 30 minutes) and contains articles
    if _news_cache["articles"] and (current_time - _news_cache["timestamp"]) < CACHE_DURATION_SECONDS:
        logger.info("Returning cached wildlife news (Cache age: %.1f seconds)", current_time - _news_cache["timestamp"])
        return _news_cache["articles"]

    api_key = settings.NEWSDATA_API_KEY or os.getenv("NEWSDATA_API_KEY")
    if not api_key:
        logger.warning("NEWSDATA_API_KEY environment variable is missing. Unable to fetch live news.")
        return _news_cache["articles"]

    query = 'wildlife OR conservation OR "endangered species" OR biodiversity OR habitat OR IUCN'
    encoded_q = urllib.parse.quote(query)
    url = f"https://newsdata.io/api/1/news?apikey={api_key}&q={encoded_q}&language=en"

    logger.info("Fetching fresh news from NewsData.io API...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode('utf-8')
            data = json.loads(body)
            
            if data.get("status") == "success" and data.get("results"):
                results = data["results"]
                # Filter for wildlife relevance
                wildlife_articles = [art for art in results if is_wildlife_news(art)]
                if not wildlife_articles:
                    wildlife_articles = results

                # Format and pick latest 3 articles
                parsed_articles = [format_article(art) for art in wildlife_articles[:3]]
                
                if parsed_articles:
                    # Update cache
                    _news_cache["timestamp"] = current_time
                    _news_cache["articles"] = parsed_articles
                    logger.info("Successfully updated news cache with %d articles.", len(parsed_articles))
                    return parsed_articles
            else:
                logger.warning("NewsData.io returned status '%s' or empty results.", data.get("status"))
    except Exception as err:
        logger.error("Failed to fetch news from NewsData.io: %s", err)

    # Fallback to existing cached articles if network/API call fails
    return _news_cache["articles"]
