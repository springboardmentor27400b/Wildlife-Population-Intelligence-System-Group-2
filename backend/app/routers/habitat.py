from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.habitat_service import (
    classify_habitats,detect_habitat_degradation,analyze_vegetation,
    monitor_environmental_conditions,predict_habitat_suitability
)


router = APIRouter(
    prefix="/habitat",
    tags=["Habitat Intelligence"]
)


@router.get("/classification")
def habitat_classification(
    db: Session = Depends(get_db)
):

    return {
        "habitats":
            classify_habitats(db)
    }
@router.get("/degradation")
def habitat_degradation(
    db: Session = Depends(get_db)
):

    return {
        "habitat_degradation":
            detect_habitat_degradation(db)
    }
@router.get("/vegetation")
def vegetation_analysis(
    db: Session = Depends(get_db)
):

    return {
        "vegetation_analysis":
            analyze_vegetation(db)
    }
@router.get("/environmental-conditions")
def environmental_conditions(
    db: Session = Depends(get_db)
):

    return {
        "environmental_conditions":
            monitor_environmental_conditions(db)
    }
@router.get("/suitability")
def habitat_suitability(
    db: Session = Depends(get_db)
):

    return {
        "habitat_suitability":
            predict_habitat_suitability(db)
    }