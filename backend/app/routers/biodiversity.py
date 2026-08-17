from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.biodiversity_service import (
    calculate_biodiversity_index, calculate_species_diversity, calculate_habitat_health, calculate_ecosystem_monitoring,
    calculate_conservation_priority
)


router = APIRouter(
    prefix="/biodiversity",
    tags=["Biodiversity Intelligence"]
)


@router.get("/index")
def biodiversity_index(
    db: Session = Depends(get_db)
):

    return calculate_biodiversity_index(db)
@router.get("/species-diversity")
def species_diversity(
    db: Session = Depends(get_db)
):

    return calculate_species_diversity(db)
@router.get("/habitat-health")
def habitat_health(
    db: Session = Depends(get_db)
):

    return {
        "habitat_health":
            calculate_habitat_health(db)
    }
@router.get("/ecosystem-monitoring")
def ecosystem_monitoring(
    db: Session = Depends(get_db)
):

    return {
        "ecosystem_monitoring":
            calculate_ecosystem_monitoring(db)
    }
@router.get("/conservation-priority")
def conservation_priority(
    db: Session = Depends(get_db)
):

    return {
        "conservation_priority":
            calculate_conservation_priority(db)
    }