from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Observation
from app.services.ai_service import analyze_image

router = APIRouter(
    prefix="/ai",
    tags=["AI Analysis"]
)
from fastapi import UploadFile, File

@router.post("/analyze-image")
async def analyze_image_endpoint(
    image: UploadFile = File(...)
):

    result = analyze_image(image)

    return result