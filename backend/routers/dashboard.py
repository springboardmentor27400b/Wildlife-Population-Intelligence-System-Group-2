from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from auth import get_current_user
from database import get_db
from services.dashboard_service import (
    get_category_stats,
    get_dashboard_stats,
    get_population_stats,
    get_recent_species,
    get_status_stats,
    get_static_dashboard_stats,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def dashboard_stats(current_user: models.User = Depends(get_current_user)):
    return get_static_dashboard_stats()


@router.get("")
def dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return get_dashboard_stats(db)


@router.get("/category")
def dashboard_category(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return get_category_stats(db)


@router.get("/recent")
def dashboard_recent(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return get_recent_species(db)


@router.get("/status")
def dashboard_status(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return get_status_stats(db)


@router.get("/population")
def dashboard_population(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return get_population_stats(db)
