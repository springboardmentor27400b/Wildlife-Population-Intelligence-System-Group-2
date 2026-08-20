from fastapi import APIRouter, Depends
from typing import Optional, Any
from fastapi.responses import StreamingResponse
from app.services.habitat_intelligence_service import HabitatIntelligenceService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    site_name: Optional[str] = None,
    min_quality: Optional[int] = None,
    risk_level: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    return await HabitatIntelligenceService.get_habitat_summary(
        start_date, end_date, species, site_name, min_quality, risk_level
    )

@router.get("/dashboard")
async def get_dashboard(current_user: Any = Depends(get_current_user)):
    return await HabitatIntelligenceService.get_habitat_summary()

@router.get("/export/{format_type}")
async def export_data(
    format_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    site_name: Optional[str] = None,
    min_quality: Optional[int] = None,
    risk_level: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    if format_type == "excel":
        return await HabitatIntelligenceService.export_excel(start_date, end_date, species, site_name, min_quality, risk_level)
    elif format_type == "csv":
        return await HabitatIntelligenceService.export_csv(start_date, end_date, species, site_name, min_quality, risk_level)
    elif format_type == "pdf":
        return await HabitatIntelligenceService.export_pdf(start_date, end_date, species, site_name, min_quality, risk_level)
    elif format_type == "json":
        return await HabitatIntelligenceService.export_json(start_date, end_date, species, site_name, min_quality, risk_level)
    return {"error": "Invalid format"}

@router.get("/{site_id}")
async def get_site_details(site_id: str, current_user: Any = Depends(get_current_user)):
    return await HabitatIntelligenceService.get_site_details(site_id)
