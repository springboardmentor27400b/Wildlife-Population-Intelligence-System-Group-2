from fastapi import APIRouter, Depends, Query
from typing import Optional, Any
from fastapi.responses import StreamingResponse
from app.services.population_estimation_service import PopulationEstimationService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    site_name: Optional[str] = None,
    min_confidence: Optional[float] = None,
    source: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    return await PopulationEstimationService.get_population_summary(
        start_date, end_date, species, site_name, min_confidence, source
    )

@router.get("/dashboard")
async def get_dashboard(current_user: Any = Depends(get_current_user)):
    return await PopulationEstimationService.get_population_summary()

@router.get("/export/{format_type}")
async def export_data(
    format_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    site_name: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    if format_type == "excel":
        return await PopulationEstimationService.export_excel(start_date, end_date, species, site_name)
    elif format_type == "csv":
        return await PopulationEstimationService.export_csv(start_date, end_date, species, site_name)
    elif format_type == "pdf":
        return await PopulationEstimationService.export_pdf(start_date, end_date, species, site_name)
    elif format_type == "json":
        return await PopulationEstimationService.export_json(start_date, end_date, species, site_name)
    return {"error": "Invalid format"}

@router.get("/{species_name}")
async def get_species_detail(species_name: str, current_user: Any = Depends(get_current_user)):
    return await PopulationEstimationService.get_species_detail(species_name)
