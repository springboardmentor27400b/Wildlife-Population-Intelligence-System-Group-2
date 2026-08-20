from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.services.ecosystem_health_history_service import (
    get_health_history,
)

from app.services.population_growth_service import (
    get_population_growth,
)

from app.services.population_estimation_service import (
    get_population_estimation,
)

from app.services.analytics_service import (
    species_distribution,
    biodiversity_by_habitat,
    population_by_habitat,
    ecosystem_health,
    population_stability,
    protected_area_analytics,
    get_monthly_observation_trends,
    get_species_trends,
    get_conservation_status,
    conservation_species,
    threatened_species,
)

from app.services.conservation_recommendation_service import (
    get_conservation_recommendations,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# =========================================================
# CONSERVATION INTELLIGENCE
# =========================================================


@router.get("/conservation-species")
def get_conservation_species(
    db: Session = Depends(get_db),
):
    return conservation_species(db)


@router.get("/conservation-status")
def get_conservation_status_data(
    db: Session = Depends(get_db),
):
    return get_conservation_status(db)


@router.get("/threatened-species")
def get_threatened_species(
    db: Session = Depends(get_db),
):
    return threatened_species(db)


# =========================================================
# CONSERVATION RECOMMENDATION ENGINE
# =========================================================


@router.get("/conservation-recommendations")
def get_conservation_recommendations_data(
    db: Session = Depends(get_db),
):
    return get_conservation_recommendations(db)


# =========================================================
# SPECIES ANALYTICS
# =========================================================


@router.get("/species-trends")
def species_trends(
    db: Session = Depends(get_db),
):
    return get_species_trends(db)


@router.get("/species-distribution")
def get_species_distribution(
    db: Session = Depends(get_db),
):
    return species_distribution(db)


# =========================================================
# OBSERVATION ANALYTICS
# =========================================================


@router.get("/monthly-observations")
def monthly_observations(
    db: Session = Depends(get_db),
):
    return get_monthly_observation_trends(db)


# =========================================================
# HABITAT ANALYTICS
# =========================================================


@router.get("/biodiversity-by-habitat")
def get_biodiversity_by_habitat(
    db: Session = Depends(get_db),
):
    return biodiversity_by_habitat(db)


@router.get("/population-by-habitat")
def get_population_by_habitat(
    db: Session = Depends(get_db),
):
    return population_by_habitat(db)


# =========================================================
# ECOSYSTEM HEALTH
# =========================================================


@router.get("/ecosystem-health")
def get_ecosystem_health(
    db: Session = Depends(get_db),
):
    return ecosystem_health(db)


@router.get("/ecosystem-health-history")
def ecosystem_health_history(
    db: Session = Depends(get_db),
):
    return get_health_history(db)


# =========================================================
# POPULATION ANALYTICS
# =========================================================


@router.get("/population-stability")
def get_population_stability(
    db: Session = Depends(get_db),
):
    return population_stability(db)


@router.get("/population-estimation")
def population_estimation(
    db: Session = Depends(get_db),
):
    return get_population_estimation(db)


@router.get("/population-growth")
def population_growth(
    db: Session = Depends(get_db),
):
    return get_population_growth(db)


# =========================================================
# PROTECTED AREA ANALYTICS
# =========================================================


@router.get("/protected-area")
def get_protected_area_analytics(
    db: Session = Depends(get_db),
):
    return protected_area_analytics(db)