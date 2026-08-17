from fastapi import APIRouter
from app.services.distribution_service import species_distribution

router = APIRouter(
    prefix="/distribution",
    tags=["Species Distribution"]
)

@router.post("/analysis")
async def distribution_analysis(data: dict):

    species = data.get("species", [])

    return species_distribution(species)