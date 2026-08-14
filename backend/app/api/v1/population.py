from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.population import PopulationAnalysisResponse
from app.services.population_service import population_service

router = APIRouter()

@router.get("", response_model=PopulationAnalysisResponse)
def get_population_trends(
    species_name: Optional[str] = Query(None, description="Optional species name filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Exposes population density index, alert indicators, growth rates, and regression forecasts.
    """
    return population_service.analyze_population(db, species_name=species_name)
