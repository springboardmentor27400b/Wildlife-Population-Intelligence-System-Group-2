from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.wildlife_analysis_service import (
    analyze_wildlife_image,
)


router = APIRouter(
    prefix="/wildlife-analysis",
    tags=["Wildlife Analysis"],
)


class WildlifeImageRequest(BaseModel):
    image_path: str


@router.post("/analyze")
def analyze(request: WildlifeImageRequest):

    try:

        result = analyze_wildlife_image(
            request.image_path
        )

        return {
            "success": True,
            **result,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )