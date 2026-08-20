from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.permissions import require_roles
from app.database.database import get_db
from app.schemas.protected_area import (
    ProtectedAreaCreate,
    ProtectedAreaResponse,
)
from app.services.protected_area_service import (
    create_protected_area,
    get_all_protected_areas,
    get_protected_area_by_id,
)

router = APIRouter(
    prefix="/protected-areas",
    tags=["Protected Areas"],
)


@router.post(
    "/",
    response_model=ProtectedAreaResponse,
    status_code=201,
)
def add_protected_area(
    area: ProtectedAreaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([1])),
):
    new_area = create_protected_area(db, area)

    if new_area is None:
        raise HTTPException(
            status_code=400,
            detail="Protected Area already exists",
        )

    return new_area


@router.get(
    "/",
    response_model=List[ProtectedAreaResponse],
)
def list_protected_areas(
    db: Session = Depends(get_db),
):
    return get_all_protected_areas(db)


@router.get(
    "/{area_id}",
    response_model=ProtectedAreaResponse,
)
def get_protected_area(
    area_id: int,
    db: Session = Depends(get_db),
):
    area = get_protected_area_by_id(db, area_id)

    if area is None:
        raise HTTPException(
            status_code=404,
            detail="Protected Area not found",
        )

    return area