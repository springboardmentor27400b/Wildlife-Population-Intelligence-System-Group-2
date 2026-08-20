from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.services.protected_area_analytics_service import (
    protected_area_analytics,
)

router = APIRouter(
    prefix="/analytics",
    tags=["Protected Area Analytics"],
)


@router.get("/protected-area")
def get_protected_area(
    db: Session = Depends(get_db)
):
    return protected_area_analytics(db)