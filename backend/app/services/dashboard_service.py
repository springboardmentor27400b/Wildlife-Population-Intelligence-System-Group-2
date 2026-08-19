from app.services.population_service import calculate_population_size
from app.services.trend_service import calculate_population_trend
from app.services.migration_service import analyze_migration
from app.services.distribution_service import species_distribution
from sqlalchemy.orm import Session
from app.models import Observation

def dashboard_metrics(db: Session):

    observations = db.query(Observation).all()

    population_size = calculate_population_size(db)

    survey_area = 5

    density = round(population_size / survey_area, 2)

    species = []

    for obs in observations:

        if not obs.species_name:
            continue

        name = obs.species_name.strip().lower()

        # Normalize spelling/capitalization
        if name in ["bengal tiger", "tiger"]:
            name = "Bengal Tiger"

        elif name in ["elephant"]:
            name = "Elephant"

        elif name in ["lion"]:
            name = "Lion"

        elif name in ["goat"]:
            name = "Goat"

        elif name in ["deer"]:
            name = "Deer"

        elif name in ["lepoard", "leopard"]:
            name = "Leopard"

        else:
            name = name.title()

        species.extend(
            [name] * (obs.count or 0)
        )

    distribution = species_distribution(species)
    trend = calculate_population_trend(
        population_size,
        max(population_size - 5, 0)
    )

    dominant_species = distribution["dominant_species"] or "Unknown"

    migration = analyze_migration(
        dominant_species,
        "North Forest",
        "East Forest"
    )

    return {

        "population_metrics": {

            "population_size": population_size,

            "density": density,

            "growth_rate": trend["growth_rate"],

            "trend": trend["trend"],

            "migration_pattern": migration["migration_pattern"],

            "migration_status": migration["migration_status"],

            "species_richness": distribution["species_richness"],

            "dominant_species": dominant_species

        },

        "species_distribution":
            distribution["species_distribution"]

    }
from sqlalchemy import extract


def population_history(db: Session):

    results = (
        db.query(
            extract("month", Observation.observation_date).label("month"),
            Observation.count
        )
        .filter(Observation.observation_date.isnot(None))
        .all()
    )

    monthly_population = {}

    for month, count in results:

        month_number = int(month)

        monthly_population[month_number] = (
            monthly_population.get(month_number, 0)
            + (count or 0)
        )

    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    return [
        {
            "month": month_names[month - 1],
            "population": monthly_population.get(month, 0)
        }
        for month in sorted(monthly_population)
    ]


