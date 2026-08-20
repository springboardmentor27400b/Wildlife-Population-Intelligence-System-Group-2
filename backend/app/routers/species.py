from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.permissions import require_roles
from app.database.database import get_db
from app.schemas.species import SpeciesCreate, SpeciesResponse
from app.services.species_service import (
    create_species,
    get_all_species,
    get_species_by_id,
)

router = APIRouter(
    prefix="/species",
    tags=["Species"],
)


@router.post(
    "/",
    response_model=SpeciesResponse,
)
def add_species(
    species: SpeciesCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([1])),
):
    new_species = create_species(db, species)

    if new_species is None:
        raise HTTPException(
            status_code=400,
            detail="Species already exists",
        )

    return new_species


@router.get(
    "/",
    response_model=List[SpeciesResponse],
)
def list_species(
    db: Session = Depends(get_db),
):
    return get_all_species(db)


@router.get(
    "/{species_id}",
    response_model=SpeciesResponse,
)
def get_species(
    species_id: int,
    db: Session = Depends(get_db),
):
    species = get_species_by_id(db, species_id)

    if species is None:
        raise HTTPException(
            status_code=404,
            detail="Species not found",
        )

    return species