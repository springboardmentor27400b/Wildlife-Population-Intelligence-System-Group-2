from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.api.auth import get_current_user
from app.models.user import User
from app.services.biodiversity_analytics_service import BiodiversityAnalyticsService

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    source: Optional[str] = None,
    conservation_status: Optional[str] = None,
    habitat: Optional[str] = None,
    category: Optional[str] = None,
    observer: Optional[str] = None,
    site_name: Optional[str] = None,
    confidence_min: Optional[float] = None,
    confidence_max: Optional[float] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Fetch comprehensive biodiversity analytics including summaries, distributions, and trends.
    """
    return await BiodiversityAnalyticsService.get_summary_analytics(
        start_date=start_date,
        end_date=end_date,
        species=species,
        source=source,
        conservation_status=conservation_status,
        habitat=habitat,
        category=category,
        observer=observer,
        site_name=site_name,
        confidence_min=confidence_min,
        confidence_max=confidence_max
    )

@router.get("/export/excel")
async def export_analytics_excel(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Export the analytics summary as an Excel document.
    """
    return await BiodiversityAnalyticsService.export_excel(
        start_date=start_date,
        end_date=end_date,
        species=species,
        source=source
    )

@router.get("/export/pdf")
async def export_analytics_pdf(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Export the analytics summary as a PDF document.
    """
    return await BiodiversityAnalyticsService.export_pdf(
        start_date=start_date,
        end_date=end_date,
        species=species,
        source=source
    )

@router.get("/export/json")
async def export_analytics_json(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Export the analytics summary as a JSON document.
    """
    return await BiodiversityAnalyticsService.export_json(
        start_date=start_date,
        end_date=end_date,
        species=species,
        source=source
    )
