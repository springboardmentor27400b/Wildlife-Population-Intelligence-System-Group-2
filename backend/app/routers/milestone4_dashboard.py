from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.services.population_engine_service import (
    get_population_dashboard,
)


router = APIRouter(
    prefix="/api/milestone4",
    tags=["Milestone 4 Executive Dashboard"],
)


@router.get("/health")
def milestone4_health() -> dict[str, str]:

    return {
        "status": "ok",
        "module": "milestone4",
        "message": "Milestone 4 Executive Dashboard API is running",
    }


@router.get("/dashboard")
def dashboard(
    species: str | None = Query(
        default=None,
    ),
    protected_area_id: int | None = Query(
        default=None,
    ),
) -> Any:

    try:

        return get_population_dashboard(
            species=species,
            protected_area_id=protected_area_id,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get("/summary")
def summary() -> dict[str, Any]:

    try:

        data = get_population_dashboard()

        return {
            "status": "success",
            "data": data,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc