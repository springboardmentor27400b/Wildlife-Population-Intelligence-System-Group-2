from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.permissions import require_roles
from app.database.database import get_db
from app.schemas.wildlife_observation import (
    WildlifeObservationCreate,
    WildlifeObservationResponse,
)
from app.services.wildlife_observation_service import (
    create_observation,
    get_all_observations,
    get_observation,
)

router = APIRouter(
    prefix="/wildlife-observations",
    tags=["Wildlife Observations"],
)


@router.post(
    "/",
    response_model=WildlifeObservationResponse,
    status_code=201,
)
def add_observation(
    observation: WildlifeObservationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([1])),
):
    return create_observation(
    db,
    observation,
    current_user.id,
)


@router.get(
    "/",
    response_model=List[WildlifeObservationResponse],
)
def list_observations(
    db: Session = Depends(get_db),
):
    return get_all_observations(db)


@router.get(
    "/{observation_id}",
    response_model=WildlifeObservationResponse,
)
def get_single_observation(
    observation_id: int,
    db: Session = Depends(get_db),
):
    observation = get_observation(db, observation_id)

    if observation is None:
        raise HTTPException(
            status_code=404,
            detail="Observation not found",
        )

    return observation