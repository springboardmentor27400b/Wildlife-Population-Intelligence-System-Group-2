from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db
from services.species_service import (
    add_species,
    delete_species,
    get_species_list,
    update_species_item,
)

router = APIRouter(tags=["Species"])


@router.post("/species")
def create_species(
    species: schemas.SpeciesCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return add_species(db, species)


@router.get("/species", response_model=list[schemas.SpeciesResponse])
def list_species(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_species_list(db)


@router.delete("/species/{species_id}")
def remove_species(
    species_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    deleted = delete_species(db, species_id)

    if deleted is None:
        raise HTTPException(status_code=404, detail="Species not found")

    return {"message": "Species deleted successfully"}


@router.put("/species/{species_id}")
def change_species(
    species_id: int,
    species: schemas.SpeciesCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    updated = update_species_item(db, species_id, species)

    if updated is None:
        raise HTTPException(status_code=404, detail="Species not found")

    return updated
