from fastapi import APIRouter
from app.services.trend_service import calculate_population_trend

router = APIRouter(
    prefix="/trend",
    tags=["Population Trend"]
)

@router.post("/analysis")
async def trend_analysis(data: dict):

    previous = data.get("previous_population", 0)
    current = data.get("current_population", 0)

    return calculate_population_trend(
        current,
        previous
    )