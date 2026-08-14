import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.auth.guards import RoleGuard
from app.models.user import User
from app.schemas.species_profile import (
    SpeciesProfileResponse,
    SpeciesProfileCreate,
    SpeciesProfileUpdate
)
from app.schemas.common import PaginatedResult
from app.services.species_profile_service import species_profile_service
from app.utils.pagination import paginate

router = APIRouter()

@router.get("", response_model=PaginatedResult[SpeciesProfileResponse])
def list_species_profiles(
    search: Optional[str] = Query(None, description="Search by common or scientific name"),
    status: Optional[str] = Query(None, description="Filter by conservation status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and list species profiles with pagination.
    """
    skip = (page - 1) * page_size
    items, total = species_profile_service.list_profiles(
        db, search=search, conservation_status=status, skip=skip, limit=page_size
    )
    return paginate(items, total, page, page_size)

@router.get("/{profile_id}", response_model=SpeciesProfileResponse)
def get_species_profile(
    profile_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve details for a specific species profile.
    """
    return species_profile_service.get_profile(db, profile_id)

@router.post("", response_model=SpeciesProfileResponse, status_code=status.HTTP_201_CREATED)
def create_species_profile(
    profile_in: SpeciesProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleGuard(["Administrator"]))
):
    """
    Create a new species profile (Admin Only).
    """
    return species_profile_service.create_profile(db, obj_in=profile_in.model_dump())

@router.put("/{profile_id}", response_model=SpeciesProfileResponse)
def update_species_profile(
    profile_id: uuid.UUID,
    profile_in: SpeciesProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleGuard(["Administrator"]))
):
    """
    Update a species profile (Admin Only).
    """
    return species_profile_service.update_profile(db, profile_id=profile_id, obj_in=profile_in.model_dump(exclude_unset=True))

@router.delete("/{profile_id}", response_model=SpeciesProfileResponse)
def delete_species_profile(
    profile_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleGuard(["Administrator"]))
):
    """
    Delete a species profile (Admin Only).
    """
    return species_profile_service.delete_profile(db, profile_id=profile_id)
