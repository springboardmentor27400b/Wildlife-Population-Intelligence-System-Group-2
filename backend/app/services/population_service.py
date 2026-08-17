from sqlalchemy.orm import Session

from sqlalchemy import func
from app.models import Observation, MonitoringSite
def estimate_population(image_count, audio_count):
    return image_count + audio_count
def calculate_population(image_result: dict, audio_result: dict, survey_area: float = 5.0):

    image_count = image_result.get("animal_count", 0)
    audio_count = audio_result.get("animal_count", 0)

    population_size = image_count + audio_count

    density = round(population_size / survey_area, 2)
    

    return {
        "image_count": image_count,
        "audio_count": audio_count,
        "population_size": population_size,
        "survey_area": survey_area,
        "density": density
    }
def calculate_population_size(db: Session):

    observations = db.query(Observation).all()

    total_population = 0

    for obs in observations:
        total_population += obs.count or 0

    return total_population

from sqlalchemy import func


def calculate_density(db: Session):

    total_population = (
        db.query(func.sum(Observation.count))
        .scalar()
    )

    if total_population is None:
        total_population = 0

    sites = db.query(MonitoringSite).all()

    total_area = sum(
        site.area_km2
        for site in sites
        if site.area_km2
    )

    if total_area <= 0:
        return 0

    density = total_population / total_area

    return round(density, 2)



def calculate_species_richness(db: Session):

    species_count = (
        db.query(
            func.count(
                func.distinct(Observation.species_name)
            )
        )
        .filter(
            Observation.species_name.isnot(None),
            Observation.species_name != ""
        )
        .scalar()
    )

    return species_count or 0


from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Observation


def calculate_dominant_species(db: Session):

    result = (
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
        .order_by(
            func.sum(Observation.count).desc()
        )
        .first()
    )

    if result is None:
        return {
            "species": "No data",
            "population": 0
        }

    return {
        "species": result.species_name,
        "population": int(result.total_count)
    }
def calculate_species_distribution(db: Session):

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
        .order_by(
            func.sum(Observation.count).desc()
        )
        .all()
    )

    distribution = []

    for species, total_count in results:

        distribution.append({
            "species": species,
            "population": int(total_count)
        })

    return distribution
    

def calculate_population_growth(db: Session):

    monthly_data = (
        db.query(
            func.date_trunc(
                "month",
                Observation.observation_date
            ).label("month"),

            func.sum(
                Observation.count
            ).label("population")
        )
        .filter(
            Observation.observation_date.isnot(None),
            Observation.count.isnot(None)
        )
        .group_by(
            func.date_trunc(
                "month",
                Observation.observation_date
            )
        )
        .order_by(
            func.date_trunc(
                "month",
                Observation.observation_date
            )
        )
        .all()
    )

    if len(monthly_data) < 2:
        return {
            "growth_rate": 0,
            "trend": "Insufficient Data",
            "current_population": (
                int(monthly_data[0].population)
                if monthly_data else 0
            )
        }

    previous_population = float(
        monthly_data[-2].population
    )

    current_population = float(
        monthly_data[-1].population
    )

    if previous_population == 0:

        growth_rate = 0

    else:

        growth_rate = (
            (current_population - previous_population)
            / previous_population
        ) * 100

    if growth_rate > 0:
        trend = "Increasing"

    elif growth_rate < 0:
        trend = "Decreasing"

    else:
        trend = "Stable"

    return {
        "growth_rate": round(growth_rate, 2),
        "trend": trend,
        "previous_population": int(previous_population),
        "current_population": int(current_population)
    }