from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.population_service import (
    get_population_summary, get_species_population, 
    get_population_trends, get_population_density
)

router = APIRouter(prefix="/population", tags=["population"])

@router.get("")
@router.get("/")
def get_population_list(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_species_population(db)

@router.get("/dashboard")
@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_population_summary(db)

@router.get("/species")
def get_species(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_species_population(db)

@router.get("/trends")
def get_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_population_trends(db)

@router.get("/density")
def get_density(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_population_density(db)
