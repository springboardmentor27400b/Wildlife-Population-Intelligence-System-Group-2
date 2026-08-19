from fastapi import APIRouter
from app.database import get_db

from sqlalchemy.orm import Session

from fastapi import Depends

from app.services.population_service import calculate_population_size,calculate_density,calculate_species_richness,calculate_dominant_species,  calculate_species_distribution,calculate_population_growth
from app.services.dashboard_service import (
    dashboard_metrics,
    population_history,
)
from app.services.map_service import get_species_locations

router = APIRouter(
    prefix="/dashboard",
    tags=["Population Dashboard"]
)

@router.get("/metrics")
def dashboard(
    db: Session = Depends(get_db)
):
    return dashboard_metrics(db)

@router.get("/history")
async def history(
    db: Session = Depends(get_db)
):
    return population_history(db)
@router.get("/species-map")
async def species_map():
    return get_species_locations()
@router.get("/population-size")

def population_size(

    db: Session = Depends(get_db)

):

    return {

        "population_size":

        calculate_population_size(db)

    }
@router.get("/density")
def population_density(db: Session = Depends(get_db)):

    density = calculate_density(db)

    return {
        "density": density,
        "unit": "animals/km²"
    }
@router.get("/species-richness")
def species_richness(db: Session = Depends(get_db)):

    richness = calculate_species_richness(db)

    return {
        "species_richness": richness
    }
@router.get("/dominant-species")
def dominant_species(db: Session = Depends(get_db)):

    result = calculate_dominant_species(db)

    return result
@router.get("/species-distribution")
def species_distribution(
    db: Session = Depends(get_db)
):

    return {
        "species_distribution":
            calculate_species_distribution(db)
    }
@router.get("/population-growth")
def population_growth(
    db: Session = Depends(get_db)
):

    return calculate_population_growth(db)