import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.monitoring_site import (
    MonitoringSiteResponse,
    MonitoringSiteCreate,
    MonitoringSiteUpdate
)
from app.schemas.common import PaginatedResult
from app.services.monitoring_site_service import monitoring_site_service
from app.models.user import User
from app.models.enums import HabitatType
from app.auth.guards import PermissionGuard
from app.auth.permissions import (
    PERM_SITE_CREATE,
    PERM_SITE_UPDATE,
    PERM_SITE_DELETE
)
from app.utils.pagination import paginate

router = APIRouter()

@router.get("", response_model=PaginatedResult[MonitoringSiteResponse])
def list_sites(
    survey_id: Optional[uuid.UUID] = Query(None, description="Filter by survey"),
    habitat_type: Optional[HabitatType] = Query(None, description="Filter by habitat type"),
    search: Optional[str] = Query(None, description="Search by site name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and list monitoring sites with filtering and pagination.
    """
    skip = (page - 1) * page_size
    items, total = monitoring_site_service.search_sites(
        db, survey_id=survey_id, habitat_type=habitat_type, search_query=search, skip=skip, limit=page_size
    )
    return paginate(items, total, page, page_size)

@router.get("/{site_id}", response_model=MonitoringSiteResponse)
def get_site(
    site_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed properties of a monitoring site.
    """
    return monitoring_site_service.get_site(db, site_id)

@router.post("", response_model=MonitoringSiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    site_in: MonitoringSiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_SITE_CREATE))
):
    """
    Create a new monitoring site inside a survey (requires permissions).
    """
    return monitoring_site_service.create_site(
        db,
        name=site_in.name,
        description=site_in.description,
        latitude=site_in.latitude,
        longitude=site_in.longitude,
        habitat_type=site_in.habitat_type,
        survey_id=site_in.survey_id
    )

@router.put("/{site_id}", response_model=MonitoringSiteResponse)
def update_site(
    site_id: uuid.UUID,
    site_in: MonitoringSiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_SITE_UPDATE))
):
    """
    Update monitoring site properties (requires permissions).
    """
    return monitoring_site_service.update_site(
        db,
        site_id=site_id,
        name=site_in.name,
        description=site_in.description,
        latitude=site_in.latitude,
        longitude=site_in.longitude,
        habitat_type=site_in.habitat_type
    )

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_SITE_DELETE))
):
    """
    Delete a monitoring site (requires permissions).
    """
    monitoring_site_service.delete_site(db, site_id)
    return None
