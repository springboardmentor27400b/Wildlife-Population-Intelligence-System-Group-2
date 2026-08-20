from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db
from auth import get_current_user


router = APIRouter(
    prefix="/wildlife-movement",
    tags=["Wildlife Movement"]
)


# =========================================================
# MOVEMENT SUMMARY
# =========================================================

@router.get("/summary")
def movement_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    observations = (
        db.query(models.Observation)
        .filter(
            models.Observation.latitude.isnot(None)
        )
        .filter(
            models.Observation.longitude.isnot(None)
        )
        .all()
    )

    animals_tracked = (
        db.query(models.Observation.species_id)
        .filter(
            models.Observation.species_id.isnot(None)
        )
        .distinct()
        .count()
    )

    movement_records = len(observations)

    active_zones = (
        db.query(models.Observation.location)
        .filter(
            models.Observation.location.isnot(None)
        )
        .distinct()
        .count()
    )

    movement_events = len(observations)

    movements = []

    for observation in observations:

        species = (
            db.query(models.Species)
            .filter(
                models.Species.id
                == observation.species_id
            )
            .first()
        )

        movements.append({
            "id": observation.id,

            "species_id":
                observation.species_id,

            "species":
                species.species_name
                if species
                else "Unknown",

            "location":
                observation.location,

            "latitude":
                observation.latitude,

            "longitude":
                observation.longitude,

            "observation_date":
                observation.observation_date,

            "population_count":
                observation.population_count
        })

    return {
        "animals_tracked": animals_tracked,
        "movement_records": movement_records,
        "active_zones": active_zones,
        "movement_events": movement_events,
        "movements": movements
    }