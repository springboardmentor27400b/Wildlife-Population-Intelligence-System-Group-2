from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.image_analysis_service import analyze_image


router = APIRouter(
    prefix="/image-analysis",
    tags=["Image Analysis"],
)


class ImageRequest(BaseModel):
    image_path: str


@router.post("/predict")
def predict(request: ImageRequest):
    """
    Classify an image using the trained wildlife species model.
    """

    try:
        result = analyze_image(request.image_path)

        return {
            "success": True,
            "species_classification": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )