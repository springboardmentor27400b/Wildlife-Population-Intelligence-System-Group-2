from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import models
import schemas

from auth import get_current_user
from database import get_db


router = APIRouter(
    prefix="/observations",
    tags=["Observation Management"]
)


# =========================================================
# CREATE OBSERVATION
# =========================================================

@router.post(
    "",
    response_model=schemas.ObservationResponse
)
def create_observation(
    observation: schemas.ObservationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new wildlife observation.
    """

    return crud.create_observation(
        db=db,
        observation=observation
    )


# =========================================================
# GET ALL OBSERVATIONS
# =========================================================

@router.get(
    "",
    response_model=List[schemas.ObservationResponse]
)
def get_observations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Return all wildlife observations.
    """

    return crud.get_observations(db)


# =========================================================
# GET OBSERVATION BY ID
# =========================================================

@router.get(
    "/{observation_id}",
    response_model=schemas.ObservationResponse
)
def get_observation(
    observation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Return one observation by ID.
    """

    observation = crud.get_observation(
        db=db,
        observation_id=observation_id
    )

    if observation is None:
        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    return observation


# =========================================================
# UPDATE OBSERVATION
# =========================================================

@router.put(
    "/{observation_id}",
    response_model=schemas.ObservationResponse
)
def update_observation(
    observation_id: int,
    observation: schemas.ObservationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update an existing wildlife observation.
    """

    updated_observation = crud.update_observation(
        db=db,
        observation_id=observation_id,
        observation=observation
    )

    if updated_observation is None:
        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    return updated_observation


# =========================================================
# DELETE OBSERVATION
# =========================================================

@router.delete("/{observation_id}")
def delete_observation(
    observation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete an observation.
    """

    # Only Administrator can delete observations
    if current_user.role != "Administrator":
        raise HTTPException(
            status_code=403,
            detail="Only Administrator can delete observations"
        )

    deleted_observation = crud.delete_observation(
        db=db,
        observation_id=observation_id
    )

    if deleted_observation is None:
        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    return {
        "message": "Observation deleted successfully",
        "id": observation_id
    }