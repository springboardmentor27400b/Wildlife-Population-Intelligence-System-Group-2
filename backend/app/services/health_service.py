from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Observation


# --------------------------------------------------
# Species Diversity Score
# --------------------------------------------------

def calculate_species_diversity(
    db: Session
):

    total_species = (
        db.query(
            func.count(
                func.distinct(
                    Observation.species_name
                )
            )
        )
        .scalar()
        or 0
    )

    total_observations = (
        db.query(
            func.count(
                Observation.id
            )
        )
        .scalar()
        or 0
    )

    if total_observations == 0:
        return 0

    # Diversity relative to observation activity
    score = (
        total_species /
        total_observations
    ) * 100

    return round(
        min(score, 100),
        2
    )


# --------------------------------------------------
# Population Stability Score
# --------------------------------------------------

def calculate_population_stability(
    db: Session
):

    total_population = (
        db.query(
            func.sum(
                Observation.count
            )
        )
        .scalar()
        or 0
    )

    total_observations = (
        db.query(
            func.count(
                Observation.id
            )
        )
        .scalar()
        or 0
    )

    if total_observations == 0:
        return 0

    average_population = (
        total_population /
        total_observations
    )

    score = min(
        average_population * 10,
        100
    )

    return round(
        score,
        2
    )


# --------------------------------------------------
# Habitat Quality Score
# --------------------------------------------------

def calculate_habitat_quality(
    db: Session
):

    habitats = (
        db.query(
            Observation.location
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .distinct()
        .count()
    )

    species = (
        db.query(
            func.count(
                func.distinct(
                    Observation.species_name
                )
            )
        )
        .scalar()
        or 0
    )

    if habitats == 0:
        return 0

    score = (
        species /
        habitats
    ) * 20

    return round(
        min(score, 100),
        2
    )


# --------------------------------------------------
# Endangered Species Score
# --------------------------------------------------

def calculate_endangered_species_score(
    db: Session
):

    endangered_keywords = [
        "endangered",
        "critically endangered",
        "vulnerable"
    ]

    species_rows = (
        db.query(
            Observation.species_name
        )
        .filter(
            Observation.species_name.isnot(None)
        )
        .distinct()
        .all()
    )

    total_species = len(
        species_rows
    )

    if total_species == 0:
        return 0

    endangered_count = 0

    for row in species_rows:

        species_name = (
            row.species_name or ""
        ).lower()

        # Uses species naming as a
        # conservation-risk indicator.
        if any(
            keyword in species_name
            for keyword in endangered_keywords
        ):
            endangered_count += 1

    risk_ratio = (
        endangered_count /
        total_species
    )

    score = (
        100 -
        (risk_ratio * 100)
    )

    return round(
        max(score, 0),
        2
    )


# --------------------------------------------------
# Environmental Condition Score
# --------------------------------------------------

def calculate_environmental_condition(
    db: Session
):

    observations = (
        db.query(
            func.count(
                Observation.id
            )
        )
        .scalar()
        or 0
    )

    species = (
        db.query(
            func.count(
                func.distinct(
                    Observation.species_name
                )
            )
        )
        .scalar()
        or 0
    )

    if observations == 0:
        return 0

    monitoring_score = min(
        observations * 5,
        100
    )

    species_score = min(
        species * 10,
        100
    )

    score = (
        monitoring_score * 0.5
        +
        species_score * 0.5
    )

    return round(
        min(score, 100),
        2
    )


# --------------------------------------------------
# Overall Ecosystem Health
# --------------------------------------------------

def calculate_ecosystem_health(
    db: Session
):

    species_diversity = (
        calculate_species_diversity(db)
    )

    population_stability = (
        calculate_population_stability(db)
    )

    habitat_quality = (
        calculate_habitat_quality(db)
    )

    endangered_status = (
        calculate_endangered_species_score(db)
    )

    environmental_condition = (
        calculate_environmental_condition(db)
    )

    # ----------------------------------------------
    # Weighted scoring model
    # ----------------------------------------------

    overall_score = (

        species_diversity * 0.30

        +

        population_stability * 0.25

        +

        habitat_quality * 0.20

        +

        endangered_status * 0.15

        +

        environmental_condition * 0.10

    )

    overall_score = round(
        min(
            max(
                overall_score,
                0
            ),
            100
        ),
        2
    )

    # ----------------------------------------------
    # Conservation status
    # ----------------------------------------------

    if overall_score >= 85:

        conservation_status = "Excellent"

    elif overall_score >= 70:

        conservation_status = "Healthy"

    elif overall_score >= 50:

        conservation_status = "Moderate Concern"

    elif overall_score >= 30:

        conservation_status = "Vulnerable"

    else:

        conservation_status = "Critical"

    return {

        "species_diversity_score":
            species_diversity,

        "population_stability_score":
            population_stability,

        "habitat_quality_score":
            habitat_quality,

        "endangered_species_score":
            endangered_status,

        "environmental_condition_score":
            environmental_condition,

        "overall_ecosystem_health_score":
            overall_score,

        "conservation_status":
            conservation_status

    }