from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.species import Species
from app.models.wildlife_observation import WildlifeObservation


def get_threat_alerts(db: Session):

    alerts = []

    # Endangered species observations
    endangered = (
        db.query(
            Species.common_name,
            func.sum(WildlifeObservation.animal_count)
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .filter(
            Species.iucn_status.in_([
                "Endangered",
                "Critically Endangered",
                "Vulnerable",
            ])
        )
        .group_by(Species.common_name)
        .all()
    )

    for species, count in endangered:

        alerts.append({
            "level": "High",
            "title": "Endangered Species Detected",
            "message": f"{species} observed ({count} animals)"
        })

    # Low population observations
    low_population = (
        db.query(
            Species.common_name,
            WildlifeObservation.animal_count
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .filter(
            WildlifeObservation.animal_count < 5
        )
        .all()
    )

    for species, count in low_population:

        alerts.append({
            "level": "Medium",
            "title": "Low Population",
            "message": f"{species} has only {count} animals observed"
        })

    if len(alerts) == 0:

        alerts.append({
            "level": "Low",
            "title": "Healthy Ecosystem",
            "message": "No major threats detected"
        })

    return alerts