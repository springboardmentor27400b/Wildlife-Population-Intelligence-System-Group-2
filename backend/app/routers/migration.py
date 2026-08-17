from fastapi import APIRouter
from app.services.migration_service import analyze_migration

router = APIRouter(
    prefix="/migration",
    tags=["Migration Analysis"]
)

@router.post("/analysis")
async def migration_analysis(data: dict):

    species = data.get("species", "Unknown")

    previous_location = data.get("previous_location", "Unknown")

    current_location = data.get("current_location", "Unknown")

    return analyze_migration(
        species,
        previous_location,
        current_location
    )