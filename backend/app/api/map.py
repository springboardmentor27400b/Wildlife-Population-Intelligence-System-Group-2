from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from datetime import datetime

from app.models.user import User
from app.api.auth import get_current_user
from app.services.map_service import MapService

router = APIRouter()

@router.get("/sites")
async def get_map_sites_endpoint(
    current_user: User = Depends(get_current_user)
):
    """
    Return all monitoring sites with coordinates for map markers.
    """
    return await MapService.get_map_sites()

@router.get("/observations")
async def get_map_observations_endpoint(
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    verification_status: Optional[str] = None,
    prediction_source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(200, ge=1, le=1000),
    current_user: User = Depends(get_current_user)
):
    """
    Return observations (and predictions if coordinates exist) filtered and searched with pagination.
    """
    return await MapService.get_map_observations(
        species=species,
        monitoring_site_id=monitoring_site_id,
        verification_status=verification_status,
        prediction_source=prediction_source,
        start_date=start_date,
        end_date=end_date,
        search=search,
        page=page,
        limit=limit
    )

@router.get("/heatmap")
async def get_heatmap_endpoint(
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    verification_status: Optional[str] = None,
    prediction_source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Return coordinates and intensity counts for heatmap layer.
    """
    points = await MapService.get_heatmap_data(
        species=species,
        monitoring_site_id=monitoring_site_id,
        verification_status=verification_status,
        prediction_source=prediction_source,
        start_date=start_date,
        end_date=end_date,
        search=search
    )
    return {"points": points}

@router.get("/species-distribution")
async def get_species_distribution_endpoint(
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    verification_status: Optional[str] = None,
    prediction_source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Return top species distribution counts (total, verified, pending).
    """
    return await MapService.get_species_distribution(
        species=species,
        monitoring_site_id=monitoring_site_id,
        verification_status=verification_status,
        prediction_source=prediction_source,
        start_date=start_date,
        end_date=end_date,
        search=search
    )
