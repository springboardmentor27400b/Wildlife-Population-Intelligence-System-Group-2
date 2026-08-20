from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models


router = APIRouter(
    prefix="/population",
    tags=["Population Estimation"]
)


# =========================================================
# Population Dashboard
# =========================================================

@router.get("/dashboard")
def population_dashboard(db: Session = Depends(get_db)):

    # -----------------------------------------
    # Total population from observations
    # -----------------------------------------
    total_population = db.query(
        func.sum(models.Observation.population_count)
    ).scalar() or 0

    # -----------------------------------------
    # Number of distinct observed species
    # -----------------------------------------
    total_species = db.query(
        func.count(
            func.distinct(models.Observation.species_id)
        )
    ).scalar() or 0

    # -----------------------------------------
    # Total observations
    # -----------------------------------------
    total_observations = db.query(
        models.Observation
    ).count()

    # -----------------------------------------
    # Average population per observation
    # NOTE:
    # This is NOT true ecological density.
    # True density will be implemented using
    # survey/area information.
    # -----------------------------------------
    average_population_per_observation = round(
        total_population / total_observations,
        2
    ) if total_observations else 0

    # -----------------------------------------
    # Species richness
    # -----------------------------------------
    species_richness = total_species

    # -----------------------------------------
    # Growth rate
    # Calculate from earliest and latest
    # population observations.
    # -----------------------------------------
    dated_observations = (
        db.query(
            models.Observation.observation_date,
            func.sum(
                models.Observation.population_count
            ).label("population")
        )
        .filter(
            models.Observation.observation_date.isnot(None)
        )
        .group_by(
            models.Observation.observation_date
        )
        .order_by(
            models.Observation.observation_date
        )
        .all()
    )

    growth_rate = None

    if len(dated_observations) >= 2:

        first_population = dated_observations[0].population or 0
        latest_population = dated_observations[-1].population or 0

        if first_population > 0:

            growth_rate = round(
                (
                    (
                        latest_population
                        - first_population
                    )
                    / first_population
                ) * 100,
                2
            )

    return {
        "population_size": total_population,
        "population_density": average_population_per_observation,
        "growth_rate": growth_rate,
        "species_richness": species_richness,
        "total_species": total_species,
        "total_observations": total_observations
    }


# =========================================================
# Species Distribution
# =========================================================

@router.get("/species-distribution")
def species_distribution(
    db: Session = Depends(get_db)
):

    data = (
        db.query(
            models.Species.species_name,
            func.sum(
                models.Observation.population_count
            ).label("population")
        )
        .join(
            models.Observation,
            models.Species.id == models.Observation.species_id
        )
        .group_by(
            models.Species.species_name
        )
        .order_by(
            func.sum(
                models.Observation.population_count
            ).desc()
        )
        .all()
    )

    return [
        {
            "species": item.species_name,
            "population": item.population or 0
        }
        for item in data
    ]


# =========================================================
# Population Trend
# =========================================================

@router.get("/population-trend")
def population_trend(
    db: Session = Depends(get_db)
):

    data = (
        db.query(
            models.Observation.observation_date,
            func.sum(
                models.Observation.population_count
            ).label("population")
        )
        .filter(
            models.Observation.observation_date.isnot(None)
        )
        .group_by(
            models.Observation.observation_date
        )
        .order_by(
            models.Observation.observation_date
        )
        .all()
    )

    return [
        {
            "date": str(item.observation_date),
            "population": item.population or 0
        }
        for item in data
    ]


# =========================================================
# Migration Analysis
# =========================================================

@router.get("/migration-analysis")
def migration_analysis(
    db: Session = Depends(get_db)
):

    observations = (
        db.query(models.Observation)
        .filter(
            models.Observation.observation_date.isnot(None)
        )
        .order_by(
            models.Observation.species_id,
            models.Observation.observation_date
        )
        .all()
    )

    result = []

    # Store previous observation for every species
    previous_observations = {}

    for obs in observations:

        species_name = (
            obs.species.species_name
            if obs.species
            else "Unknown"
        )

        previous = previous_observations.get(
            obs.species_id
        )

        migration = "No"

        previous_location = "-"
        previous_latitude = None
        previous_longitude = None

        if previous:

            previous_location = previous.location

            previous_latitude = previous.latitude
            previous_longitude = previous.longitude

            # Basic location comparison
            if (
                previous.location
                and obs.location
                and previous.location != obs.location
            ):
                migration = "Yes"

            # If coordinates are available,
            # consider coordinate movement as well.
            elif (
                previous.latitude is not None
                and previous.longitude is not None
                and obs.latitude is not None
                and obs.longitude is not None
            ):

                if (
                    previous.latitude != obs.latitude
                    or
                    previous.longitude != obs.longitude
                ):
                    migration = "Yes"

        result.append(
            {
                "species": species_name,

                "previous_location":
                    previous_location,

                "current_location":
                    obs.location,

                "previous_latitude":
                    previous_latitude,

                "previous_longitude":
                    previous_longitude,

                "current_latitude":
                    obs.latitude,

                "current_longitude":
                    obs.longitude,

                "date":
                    str(obs.observation_date),

                "migration":
                    migration
            }
        )

        previous_observations[
            obs.species_id
        ] = obs

    return result


# =========================================================
# Species Distribution Mapping
# =========================================================

@router.get("/distribution-map")
def species_distribution_map(
    db: Session = Depends(get_db)
):

    observations = (
        db.query(models.Observation)
        .filter(
            models.Observation.latitude.isnot(None),
            models.Observation.longitude.isnot(None)
        )
        .all()
    )

    result = []

    for obs in observations:

        species_name = (
            obs.species.species_name
            if obs.species
            else "Unknown"
        )

        result.append(
            {
                "observation_id": obs.id,

                "species_id": obs.species_id,

                "species": species_name,

                "location": obs.location,

                "latitude": obs.latitude,

                "longitude": obs.longitude,

                "population":
                    obs.population_count or 0,

                "date":
                    str(obs.observation_date)
                    if obs.observation_date
                    else None
            }
        )

    return result


# =========================================================
# Population By Location
# =========================================================

@router.get("/location-distribution")
def population_by_location(
    db: Session = Depends(get_db)
):

    data = (
        db.query(
            models.Observation.location,
            func.sum(
                models.Observation.population_count
            ).label("population")
        )
        .group_by(
            models.Observation.location
        )
        .order_by(
            func.sum(
                models.Observation.population_count
            ).desc()
        )
        .all()
    )

    return [
        {
            "location": item.location,
            "population": item.population or 0
        }
        for item in data
    ]


# =========================================================
# Population By Species
# =========================================================

@router.get("/species-population")
def population_by_species(
    db: Session = Depends(get_db)
):

    data = (
        db.query(
            models.Species.id.label("species_id"),
            models.Species.species_name,
            func.sum(
                models.Observation.population_count
            ).label("population")
        )
        .join(
            models.Observation,
            models.Species.id == models.Observation.species_id
        )
        .group_by(
            models.Species.id,
            models.Species.species_name
        )
        .order_by(
            func.sum(
                models.Observation.population_count
            ).desc()
        )
        .all()
    )

    return [
        {
            "species_id": item.species_id,
            "species": item.species_name,
            "population": item.population or 0
        }
        for item in data
    ]