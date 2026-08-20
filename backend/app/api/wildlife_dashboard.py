from fastapi import APIRouter, Depends
from typing import Optional, Any
from app.services.wildlife_intelligence_dashboard_service import WildlifeIntelligenceDashboardService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/executive-summary")
async def get_executive_summary(current_user: Any = Depends(get_current_user)):
    return await WildlifeIntelligenceDashboardService.get_executive_summary()

@router.get("/observation-intelligence")
async def get_observation_intelligence(current_user: Any = Depends(get_current_user)):
    return await WildlifeIntelligenceDashboardService.get_observation_intelligence()

@router.get("/population-intelligence")
async def get_population_intelligence(current_user: Any = Depends(get_current_user)):
    return await WildlifeIntelligenceDashboardService.get_population_intelligence()

@router.get("/biodiversity-intelligence")
async def get_biodiversity_intelligence(current_user: Any = Depends(get_current_user)):
    return await WildlifeIntelligenceDashboardService.get_biodiversity_intelligence()

@router.get("/habitat-intelligence")
async def get_habitat_intelligence(current_user: Any = Depends(get_current_user)):
    return await WildlifeIntelligenceDashboardService.get_habitat_intelligence()

@router.get("/overview")
async def get_overview(current_user: Any = Depends(get_current_user)):
    return await WildlifeIntelligenceDashboardService.get_overview()

@router.get("/species")
async def get_species(current_user: Any = Depends(get_current_user)):
    # Simple redirect to population intelligence which has species stats
    return await WildlifeIntelligenceDashboardService.get_population_intelligence()

@router.get("/sites")
async def get_sites(current_user: Any = Depends(get_current_user)):
    return await WildlifeIntelligenceDashboardService.get_habitat_intelligence()

@router.get("/alerts")
async def get_alerts(current_user: Any = Depends(get_current_user)):
    data = await WildlifeIntelligenceDashboardService.get_executive_summary()
    return data.get("intelligence_alerts", [])

@router.get("/export/{format_type}")
async def export_data(format_type: str, current_user: Any = Depends(get_current_user)):
    # Fallback minimal export response since export isn't heavily implemented in this service
    return {"message": f"Export in {format_type} format not yet supported for dashboard."}
