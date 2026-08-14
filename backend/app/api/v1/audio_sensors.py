import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.audio_sensor import (
    AudioSensorResponse,
    AudioSensorCreate,
    AudioSensorUpdate
)
from app.schemas.common import PaginatedResult
from app.services.audio_sensor_service import audio_sensor_service
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

@router.get("", response_model=PaginatedResult[AudioSensorResponse])
def list_sensors(
    site_id: Optional[uuid.UUID] = Query(None, description="Filter by monitoring site"),
    status: Optional[DeviceStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by model or serial"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and list audio sensors with filtering and pagination.
    """
    skip = (page - 1) * page_size
    items, total = audio_sensor_service.search_sensors(
        db, site_id=site_id, status=status, search_query=search, skip=skip, limit=page_size
    )
    return paginate(items, total, page, page_size)

@router.get("/{sensor_id}", response_model=AudioSensorResponse)
def get_sensor(
    sensor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed properties of an audio sensor.
    """
    return audio_sensor_service.get_sensor(db, sensor_id)

@router.post("", response_model=AudioSensorResponse, status_code=status.HTTP_201_CREATED)
def create_sensor(
    sensor_in: AudioSensorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_DEVICE_CREATE))
):
    """
    Register a new audio sensor (requires permissions).
    """
    return audio_sensor_service.create_sensor(
        db,
        model=sensor_in.model,
        serial_number=sensor_in.serial_number,
        status=sensor_in.status,
        site_id=sensor_in.site_id
    )

@router.put("/{sensor_id}", response_model=AudioSensorResponse)
def update_sensor(
    sensor_id: uuid.UUID,
    sensor_in: AudioSensorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_DEVICE_UPDATE))
):
    """
    Update audio sensor configuration (requires permissions).
    """
    return audio_sensor_service.update_sensor(
        db,
        sensor_id=sensor_id,
        model=sensor_in.model,
        serial_number=sensor_in.serial_number,
        status=sensor_in.status,
        site_id=sensor_in.site_id
    )

@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor(
    sensor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_DEVICE_DELETE))
):
    """
    Remove audio sensor registration (requires permissions).
    """
    audio_sensor_service.delete_sensor(db, sensor_id)
    return None
