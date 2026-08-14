import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.camera_trap import (
    CameraTrapResponse,
    CameraTrapCreate,
    CameraTrapUpdate
)
from app.schemas.common import PaginatedResult
from app.services.camera_trap_service import camera_trap_service
from app.models.user import User
from app.models.enums import DeviceStatus
from app.auth.guards import PermissionGuard
from app.auth.permissions import (
    PERM_DEVICE_CREATE,
    PERM_DEVICE_UPDATE,
    PERM_DEVICE_DELETE
)
from app.utils.pagination import paginate

router = APIRouter()

@router.get("", response_model=PaginatedResult[CameraTrapResponse])
def list_cameras(
    site_id: Optional[uuid.UUID] = Query(None, description="Filter by monitoring site"),
    status: Optional[DeviceStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by model or serial"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and list camera traps with filtering and pagination.
    """
    skip = (page - 1) * page_size
    items, total = camera_trap_service.search_cameras(
        db, site_id=site_id, status=status, search_query=search, skip=skip, limit=page_size
    )
    return paginate(items, total, page, page_size)

@router.get("/{camera_id}", response_model=CameraTrapResponse)
def get_camera(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed properties of a camera trap.
    """
    return camera_trap_service.get_camera(db, camera_id)

@router.post("", response_model=CameraTrapResponse, status_code=status.HTTP_201_CREATED)
def create_camera(
    camera_in: CameraTrapCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_DEVICE_CREATE))
):
    """
    Register a new camera trap (requires permissions).
    """
    return camera_trap_service.create_camera(
        db,
        model=camera_in.model,
        serial_number=camera_in.serial_number,
        status=camera_in.status,
        site_id=camera_in.site_id
    )

@router.put("/{camera_id}", response_model=CameraTrapResponse)
def update_camera(
    camera_id: uuid.UUID,
    camera_in: CameraTrapUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_DEVICE_UPDATE))
):
    """
    Update camera trap configuration (requires permissions).
    """
    return camera_trap_service.update_camera(
        db,
        camera_id=camera_id,
        model=camera_in.model,
        serial_number=camera_in.serial_number,
        status=camera_in.status,
        site_id=camera_in.site_id
    )

@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_DEVICE_DELETE))
):
    """
    Remove camera trap registration (requires permissions).
    """
    camera_trap_service.delete_camera(db, camera_id)
    return None
