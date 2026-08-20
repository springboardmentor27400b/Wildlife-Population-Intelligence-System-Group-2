from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.wildlife_observation import WildlifeObservation
from app.models.species import Species
from app.models.protected_area import ProtectedArea
from app.models.user import User

from app.schemas.wildlife_observation import WildlifeObservationCreate


def create_observation(
    db: Session,
    observation: WildlifeObservationCreate,
    observer_id: int,
):
    # Check Species
    species = (
        db.query(Species)
        .filter(Species.id == observation.species_id)
        .first()
    )

    if not species:
        raise HTTPException(
            status_code=404,
            detail="Species not found"
        )

    # Check Protected Area
    protected_area = (
        db.query(ProtectedArea)
        .filter(
            ProtectedArea.id == observation.protected_area_id
        )
        .first()
    )

    if not protected_area:
        raise HTTPException(
            status_code=404,
            detail="Protected Area not found"
        )

    # Check Observer
    observer = (
        db.query(User)
        .filter(User.id == observer_id)
        .first()
    )

    if not observer:
        raise HTTPException(
            status_code=404,
            detail="Observer not found"
        )

    new_observation = WildlifeObservation(
        species_id=observation.species_id,
        protected_area_id=observation.protected_area_id,
        observer_id=observer_id,
        latitude=observation.latitude,
        longitude=observation.longitude,
        animal_count=observation.animal_count,
        observation_type=observation.observation_type,
        image_path=observation.image_path,
        notes=observation.notes,
    )

    db.add(new_observation)
    db.commit()
    db.refresh(new_observation)

    return new_observation


def get_all_observations(db: Session):
    return (
        db.query(WildlifeObservation)
        .order_by(WildlifeObservation.id.desc())
        .all()
    )


def get_observation(db: Session, observation_id: int):
    return (
        db.query(WildlifeObservation)
        .filter(WildlifeObservation.id == observation_id)
        .first()
    )
    def find_species_by_name(
    db: Session,
    species_name: str,
):    species = (
        db.query(Species)
        .filter(
            Species.common_name.ilike(species_name)
        )
        .first()
    )

    return species