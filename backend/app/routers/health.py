from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.services.health_service import (
    calculate_ecosystem_health
)


router = APIRouter(
    prefix="/wildlife-health",
    tags=["Wildlife Health"]
)


@router.get("/score")
def wildlife_health_score(
    db: Session = Depends(get_db)
):

    return calculate_ecosystem_health(db)