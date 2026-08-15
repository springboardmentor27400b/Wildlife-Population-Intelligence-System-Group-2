from fastapi import APIRouter
from pydantic import BaseModel

from app.species_identifier import identify_species

router = APIRouter()


class Prediction(BaseModel):
    predictedSpecies: str
    confidence: float


class SpeciesRequest(BaseModel):
    image: Prediction
    audio: Prediction


@router.post("/identify-species")
def identify(request: SpeciesRequest):

    result = identify_species(
        request.image.dict(),
        request.audio.dict()
    )

    return result