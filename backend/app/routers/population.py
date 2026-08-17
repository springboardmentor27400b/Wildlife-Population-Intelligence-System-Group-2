from fastapi import APIRouter
from app.services.population_service import calculate_population

router = APIRouter(
    prefix="/population",
    tags=["Population Estimation"]
)

@router.post("/count")
async def population_count(data: dict):

    image_result = data.get("image_result", {})
    audio_result = data.get("audio_result", {})

    survey_area = data.get("survey_area", 5.0)

    return calculate_population(
        image_result,
        audio_result,
        survey_area
    )