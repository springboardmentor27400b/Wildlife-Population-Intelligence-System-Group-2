from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.services.conservation_service import (
    generate_conservation_priorities,generate_habitat_restoration_suggestions,
    generate_wildlife_protection_strategies,
    generate_monitoring_optimization, generate_resource_allocation
)


router = APIRouter(
    prefix="/conservation",
    tags=["Conservation Recommendations"]
)


@router.get("/priorities")
def conservation_priorities(
    db: Session = Depends(get_db)
):

    return {
        "conservation_priorities":
            generate_conservation_priorities(db)
    }
@router.get("/habitat-restoration")
def habitat_restoration(
    db: Session = Depends(get_db)
):

    return {
        "habitat_restoration":
            generate_habitat_restoration_suggestions(
                db
            )
    }
@router.get("/wildlife-protection")
def wildlife_protection(
    db: Session = Depends(get_db)
):

    return {
        "wildlife_protection":
            generate_wildlife_protection_strategies(
                db
            )
    }
@router.get("/monitoring-optimization")
def monitoring_optimization(
    db: Session = Depends(get_db)
):

    return {
        "monitoring_optimization":
            generate_monitoring_optimization(db)
    }
@router.get("/resource-allocation")
def resource_allocation(
    db: Session = Depends(get_db)
):

    return {
        "resource_allocation":
            generate_resource_allocation(db)
    }