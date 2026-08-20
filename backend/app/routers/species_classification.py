from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.ai.species_classifier import classify_species


router = APIRouter(
    prefix="/species-classification",
    tags=["Species Classification"],
)


class SpeciesClassificationRequest(BaseModel):
    image_path: str


@router.post("/predict")
def predict_species(request: SpeciesClassificationRequest):
    try:
        result = classify_species(request.image_path)

        return {
            "success": True,
            "species_classification": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

