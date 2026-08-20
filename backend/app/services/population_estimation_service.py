from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.wildlife_observation import WildlifeObservation
from app.models.protected_area import ProtectedArea
from app.models.species import Species


def get_population_estimation(db: Session):

    # Total animals observed
    total_population = (
        db.query(
            func.coalesce(
                func.sum(WildlifeObservation.animal_count), 0
            )
        )
        .scalar()
    )

    # Number of protected areas
    total_areas = (
        db.query(func.count(ProtectedArea.id))
        .scalar()
    )

    # Number of unique observed species
    species_richness = (
        db.query(
            func.count(
                func.distinct(
                    WildlifeObservation.species_id
                )
            )
        )
        .scalar()
    )

    # Population density
    if total_areas > 0:
        density = round(total_population / total_areas, 2)
    else:
        density = 0

    # Growth status
    if total_population > 500:
        growth = "High"

    elif total_population > 200:
        growth = "Moderate"

    else:
        growth = "Low"

    return {
        "total_population": int(total_population),
        "species_richness": int(species_richness),
        "protected_areas": int(total_areas),
        "population_density": density,
        "growth_status": growth,
    }