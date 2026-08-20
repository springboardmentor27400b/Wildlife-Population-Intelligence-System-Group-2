from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.services.population_engine_service import (
    get_population_dashboard,
    get_species_population,
)


router = APIRouter(
    prefix="/api/milestone4",
    tags=["Milestone 4 Dashboard"],
)


# ============================================================
# HEALTH
# ============================================================

@router.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "module": "milestone4",
        "message": "Milestone 4 dashboard API is running",
    }


# ============================================================
# DASHBOARD
# ============================================================

@router.get("/dashboard")
def dashboard(
    species: str | None = Query(
        default=None,
        description="Optional species filter",
    ),
) -> dict[str, Any]:

    try:

        return get_population_dashboard(
            species=species,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


# ============================================================
# SPECIES POPULATION
# ============================================================

@router.get("/species-population")
def species_population(
    species: str | None = Query(
        default=None,
        description="Optional species filter",
    ),
) -> dict[str, Any]:

    try:

        data = get_species_population(
            species=species,
        )

        return {
            "status": "success",
            "count": len(data),
            "data": data,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc