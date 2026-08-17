import math
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Observation


def calculate_biodiversity_index(db: Session):

    results = (
        db.query(
            Observation.species_name,
            func.sum(Observation.count).label("total_count")
        )
        .filter(
            Observation.species_name.isnot(None),
            Observation.species_name != "",
            Observation.count.isnot(None)
        )
        .group_by(Observation.species_name)
        .all()
    )

    if not results:
        return {
            "biodiversity_index": 0,
            "species_count": 0,
            "total_population": 0
        }

    total_population = sum(
        int(row.total_count)
        for row in results
    )

    if total_population == 0:
        return {
            "biodiversity_index": 0,
            "species_count": 0,
            "total_population": 0
        }

    biodiversity_index = 0

    for row in results:

        count = int(row.total_count)

        proportion = count / total_population

        biodiversity_index -= (
            proportion * math.log(proportion)
        )

    return {
        "biodiversity_index":
            round(biodiversity_index, 4),

        "species_count":
            len(results),

        "total_population":
            total_population
    }
import math

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Observation


def calculate_species_diversity(db: Session):

    results = (
        db.query(
            Observation.species_name,
            func.sum(Observation.count).label("total_count")
        )
        .filter(
            Observation.species_name.isnot(None),
            Observation.species_name != "",
            Observation.count.isnot(None)
        )
        .group_by(
            Observation.species_name
        )
        .order_by(
            func.sum(Observation.count).desc()
        )
        .all()
    )

    # No observations
    if not results:
        return {
            "species_richness": 0,
            "total_population": 0,
            "shannon_index": 0,
            "evenness": 0,
            "dominant_species": "No Data",
            "dominant_percentage": 0,
            "species": []
        }

    total_population = sum(
        int(row.total_count)
        for row in results
    )

    species_richness = len(results)

    if total_population == 0:
        return {
            "species_richness": species_richness,
            "total_population": 0,
            "shannon_index": 0,
            "evenness": 0,
            "dominant_species": "No Data",
            "dominant_percentage": 0,
            "species": []
        }

    shannon_index = 0

    species_data = []

    for row in results:

        count = int(row.total_count)

        proportion = count / total_population

        shannon_index -= (
            proportion * math.log(proportion)
        )

        species_data.append({
            "species": row.species_name,
            "population": count,
            "percentage": round(
                proportion * 100,
                2
            )
        })

    # Maximum possible Shannon diversity
    if species_richness > 1:

        max_diversity = math.log(
            species_richness
        )

        evenness = (
            shannon_index / max_diversity
        )

    else:

        evenness = 1.0

    dominant = species_data[0]

    return {
        "species_richness":
            species_richness,

        "total_population":
            total_population,

        "shannon_index":
            round(shannon_index, 4),

        "evenness":
            round(evenness, 4),

        "dominant_species":
            dominant["species"],

        "dominant_percentage":
            dominant["percentage"],

        "species":
            species_data
    }
def calculate_habitat_health(db: Session):

    results = (
        db.query(
            Observation.location,
            func.count(
                func.distinct(Observation.species_name)
            ).label("species_count"),
            func.sum(
                Observation.count
            ).label("total_population"),
            func.count(
                Observation.id
            ).label("observation_count")
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != "",
            Observation.species_name.isnot(None),
            Observation.species_name != "",
            Observation.count.isnot(None)
        )
        .group_by(
            Observation.location
        )
        .all()
    )

    if not results:
        return []

    max_species = max(
        int(row.species_count)
        for row in results
    )

    assessments = []

    for row in results:

        species_count = int(
            row.species_count
        )

        population = int(
            row.total_population or 0
        )

        observations = int(
            row.observation_count
        )

        # Dynamic score based on species richness
        if max_species > 0:
            richness_score = (
                species_count / max_species
            ) * 100
        else:
            richness_score = 0

        # Observation activity score
        activity_score = min(
            observations * 10,
            100
        )

        # Combined proxy score
        health_score = (
            richness_score * 0.7
            + activity_score * 0.3
        )

        if health_score >= 75:
            status = "Healthy"

        elif health_score >= 50:
            status = "Moderate"

        else:
            status = "Needs Attention"

        assessments.append({

            "habitat": row.location,

            "species_count":
                species_count,

            "population":
                population,

            "observations":
                observations,

            "health_score":
                round(health_score, 2),

            "status":
                status
        })

    return assessments
from datetime import datetime, timedelta

def calculate_ecosystem_monitoring(db: Session):

    total_observations = (
        db.query(
            func.count(Observation.id)
        )
        .scalar()
        or 0
    )

    total_species = (
        db.query(
            func.count(
                func.distinct(
                    Observation.species_name
                )
            )
        )
        .filter(
            Observation.species_name.isnot(None),
            Observation.species_name != ""
        )
        .scalar()
        or 0
    )

    total_locations = (
        db.query(
            func.count(
                func.distinct(
                    Observation.location
                )
            )
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .scalar()
        or 0
    )

    # Last 30 days
    thirty_days_ago = (
        datetime.utcnow()
        - timedelta(days=30)
    )

    recent_observations = (
        db.query(
            func.count(Observation.id)
        )
        .filter(
            Observation.observation_date >=
            thirty_days_ago
        )
        .scalar()
        or 0
    )

    # Determine monitoring activity
    if recent_observations >= 20:
        monitoring_status = "High"

    elif recent_observations >= 10:
        monitoring_status = "Moderate"

    elif recent_observations > 0:
        monitoring_status = "Low"

    else:
        monitoring_status = "No Recent Activity"

    return {
        "total_observations":
            int(total_observations),

        "total_species":
            int(total_species),

        "total_locations":
            int(total_locations),

        "recent_observations":
            int(recent_observations),

        "monitoring_status":
            monitoring_status
    }
def calculate_conservation_priority(db: Session):

    results = (
        db.query(
            Observation.species_name,

            func.sum(
                Observation.count
            ).label("population"),

            func.count(
                Observation.id
            ).label("observations"),

            func.count(
                func.distinct(
                    Observation.location
                )
            ).label("locations")
        )
        .filter(
            Observation.species_name.isnot(None),
            Observation.species_name != "",
            Observation.count.isnot(None)
        )
        .group_by(
            Observation.species_name
        )
        .all()
    )

    if not results:
        return []

    priorities = []

    for row in results:

        species = row.species_name

        population = int(
            row.population or 0
        )

        observations = int(
            row.observations or 0
        )

        locations = int(
            row.locations or 0
        )

        # --------------------------------
        # Population risk
        # --------------------------------

        if population <= 5:
            population_score = 100

        elif population <= 20:
            population_score = 75

        elif population <= 50:
            population_score = 50

        elif population <= 100:
            population_score = 25

        else:
            population_score = 0

        # --------------------------------
        # Distribution risk
        # --------------------------------

        if locations <= 1:
            distribution_score = 100

        elif locations == 2:
            distribution_score = 70

        elif locations <= 4:
            distribution_score = 40

        else:
            distribution_score = 10

        # --------------------------------
        # Observation pressure
        # --------------------------------

        if observations <= 2:
            observation_score = 80

        elif observations <= 5:
            observation_score = 50

        else:
            observation_score = 20

        # --------------------------------
        # Final priority score
        # --------------------------------

        priority_score = (
            population_score * 0.5
            + distribution_score * 0.3
            + observation_score * 0.2
        )

        # --------------------------------
        # Priority level
        # --------------------------------

        if priority_score >= 75:
            priority = "Critical"

        elif priority_score >= 50:
            priority = "High"

        elif priority_score >= 25:
            priority = "Moderate"

        else:
            priority = "Low"

        priorities.append({

            "species": species,

            "population":
                population,

            "observations":
                observations,

            "locations":
                locations,

            "priority_score":
                round(priority_score, 2),

            "priority":
                priority
        })

    # Highest priority first
    priorities.sort(
        key=lambda x: x["priority_score"],
        reverse=True
    )

    return priorities