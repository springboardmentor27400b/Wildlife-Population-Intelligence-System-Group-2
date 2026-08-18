from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.api.deps import get_current_user
from app.models.sql import User
from app.services.news_service import fetch_wildlife_news

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
@router.get("/", response_model=List[Dict[str, Any]])
def get_wildlife_news(current_user: User = Depends(get_current_user)):
    """
    Returns the latest 3 wildlife conservation news articles fetched from NewsData.io.
    Responses are cached in backend for 30 minutes.
    """
    return fetch_wildlife_news()
