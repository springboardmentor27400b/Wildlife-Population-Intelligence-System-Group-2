from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Observation


def classify_habitats(db: Session):

    results = (
        db.query(
            Observation.location,
            func.count(Observation.id).label(
                "observation_count"
            ),
            func.count(
                func.distinct(
                    Observation.species_name
                )
            ).label(
                "species_count"
            ),
            func.sum(
                Observation.count
            ).label(
                "population"
            )
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .group_by(
            Observation.location
        )
        .order_by(
            func.count(Observation.id).desc()
        )
        .all()
    )

    if not results:
        return []

    habitats = []

    for row in results:

        location = row.location

        name = location.lower()

        # Classification based on existing
        # habitat/location information.
        if any(
            word in name
            for word in [
                "forest",
                "jungle",
                "woodland"
            ]
        ):
            habitat_type = "Forest"

        elif any(
            word in name
            for word in [
                "grassland",
                "grass",
                "savanna",
                "savannah"
            ]
        ):
            habitat_type = "Grassland"

        elif any(
            word in name
            for word in [
                "wetland",
                "lake",
                "river",
                "marsh",
                "pond"
            ]
        ):
            habitat_type = "Wetland"

        elif any(
            word in name
            for word in [
                "desert",
                "arid"
            ]
        ):
            habitat_type = "Desert"

        elif any(
            word in name
            for word in [
                "mountain",
                "hill"
            ]
        ):
            habitat_type = "Mountain"

        else:
            habitat_type = "Other"

        habitats.append({

            "location": location,

            "habitat_type":
                habitat_type,

            "observation_count":
                int(row.observation_count or 0),

            "species_count":
                int(row.species_count or 0),

            "population":
                int(row.population or 0)

        })

    return habitats

from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Observation


def detect_habitat_degradation(db: Session):

    habitats = (
        db.query(
            Observation.location
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .distinct()
        .all()
    )

    results = []

    for habitat_row in habitats:

        habitat = habitat_row.location

        # Current 30-day period
        current_start = (
            datetime.utcnow()
            - timedelta(days=30)
        )

        # Previous 30-day period
        previous_start = (
            datetime.utcnow()
            - timedelta(days=60)
        )

        # -----------------------------
        # Current observations
        # -----------------------------

        current = (
            db.query(
                func.count(Observation.id).label(
                    "observations"
                ),
                func.count(
                    func.distinct(
                        Observation.species_name
                    )
                ).label(
                    "species"
                ),
                func.sum(
                    Observation.count
                ).label(
                    "population"
                )
            )
            .filter(
                Observation.location == habitat,
                Observation.observation_date >=
                    current_start
            )
            .first()
        )

        # -----------------------------
        # Previous observations
        # -----------------------------

        previous = (
            db.query(
                func.count(Observation.id).label(
                    "observations"
                ),
                func.count(
                    func.distinct(
                        Observation.species_name
                    )
                ).label(
                    "species"
                ),
                func.sum(
                    Observation.count
                ).label(
                    "population"
                )
            )
            .filter(
                Observation.location == habitat,
                Observation.observation_date >=
                    previous_start,
                Observation.observation_date <
                    current_start
            )
            .first()
        )

        current_observations = int(
            current.observations or 0
        )

        previous_observations = int(
            previous.observations or 0
        )

        current_species = int(
            current.species or 0
        )

        previous_species = int(
            previous.species or 0
        )

        current_population = int(
            current.population or 0
        )

        previous_population = int(
            previous.population or 0
        )

        # -----------------------------
        # Calculate changes
        # -----------------------------

        if previous_observations > 0:

            observation_change = (
                (
                    current_observations
                    - previous_observations
                )
                / previous_observations
            ) * 100

        else:

            observation_change = 0

        if previous_species > 0:

            species_change = (
                (
                    current_species
                    - previous_species
                )
                / previous_species
            ) * 100

        else:

            species_change = 0

        if previous_population > 0:

            population_change = (
                (
                    current_population
                    - previous_population
                )
                / previous_population
            ) * 100

        else:

            population_change = 0

        # -----------------------------
        # Degradation indicators
        # -----------------------------

        degradation_score = 0

        if observation_change < -20:
            degradation_score += 35

        elif observation_change < -10:
            degradation_score += 20

        if species_change < -20:
            degradation_score += 40

        elif species_change < -10:
            degradation_score += 25

        if population_change < -20:
            degradation_score += 25

        elif population_change < -10:
            degradation_score += 15

        degradation_score = min(
            degradation_score,
            100
        )

        # -----------------------------
        # Classification
        # -----------------------------

        if degradation_score >= 70:

            status = "Severe Degradation"

        elif degradation_score >= 40:

            status = "Moderate Degradation"

        elif degradation_score > 0:

            status = "Potential Degradation"

        else:

            status = "Stable"

        results.append({

            "habitat": habitat,

            "current_observations":
                current_observations,

            "previous_observations":
                previous_observations,

            "observation_change":
                round(observation_change, 2),

            "current_species":
                current_species,

            "previous_species":
                previous_species,

            "species_change":
                round(species_change, 2),

            "current_population":
                current_population,

            "previous_population":
                previous_population,

            "population_change":
                round(population_change, 2),

            "degradation_score":
                degradation_score,

            "status":
                status
        })

    return results
def analyze_vegetation(db: Session):

    habitats = (
        db.query(
            Observation.location
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .distinct()
        .all()
    )

    results = []

    for habitat_row in habitats:

        habitat = habitat_row.location

        data = (
            db.query(
                func.count(Observation.id).label(
                    "observations"
                ),

                func.count(
                    func.distinct(
                        Observation.species_name
                    )
                ).label(
                    "species"
                ),

                func.sum(
                    Observation.count
                ).label(
                    "population"
                )
            )
            .filter(
                Observation.location == habitat
            )
            .first()
        )

        observations = int(
            data.observations or 0
        )

        species = int(
            data.species or 0
        )

        population = int(
            data.population or 0
        )

        # --------------------------------
        # Vegetation-support indicators
        # --------------------------------

        if observations > 0:

            species_density = (
                species / observations
            )

            population_density = (
                population / observations
            )

        else:

            species_density = 0
            population_density = 0

        # --------------------------------
        # Normalize indicators
        # --------------------------------

        species_score = min(
            species_density * 100,
            100
        )

        population_score = min(
            population_density * 10,
            100
        )

        vegetation_score = (
            species_score * 0.6
            + population_score * 0.4
        )

        vegetation_score = round(
            min(vegetation_score, 100),
            2
        )

        # --------------------------------
        # Vegetation condition
        # --------------------------------

        if vegetation_score >= 75:

            condition = "High"

        elif vegetation_score >= 50:

            condition = "Moderate"

        elif vegetation_score >= 25:

            condition = "Low"

        else:

            condition = "Very Low"

        results.append({

            "habitat": habitat,

            "observations":
                observations,

            "species_count":
                species,

            "population":
                population,

            "species_density":
                round(
                    species_density,
                    2
                ),

            "population_density":
                round(
                    population_density,
                    2
                ),

            "vegetation_score":
                vegetation_score,

            "vegetation_condition":
                condition

        })

    return results
def monitor_environmental_conditions(db: Session):

    habitats = (
        db.query(
            Observation.location
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .distinct()
        .all()
    )

    results = []

    for habitat_row in habitats:

        habitat = habitat_row.location

        data = (
            db.query(
                func.count(
                    Observation.id
                ).label("observations"),

                func.count(
                    func.distinct(
                        Observation.species_name
                    )
                ).label("species"),

                func.sum(
                    Observation.count
                ).label("population")
            )
            .filter(
                Observation.location == habitat
            )
            .first()
        )

        observations = int(
            data.observations or 0
        )

        species = int(
            data.species or 0
        )

        population = int(
            data.population or 0
        )

        # --------------------------------
        # Ecological indicators
        # --------------------------------

        # More species indicate stronger
        # ecological diversity.
        species_score = min(
            species * 10,
            100
        )

        # Population indicator
        population_score = min(
            population,
            100
        )

        # Monitoring activity indicator
        monitoring_score = min(
            observations * 5,
            100
        )

        # --------------------------------
        # Overall condition indicator
        # --------------------------------

        condition_score = (
            species_score * 0.4
            + population_score * 0.35
            + monitoring_score * 0.25
        )

        condition_score = round(
            min(condition_score, 100),
            2
        )

        # --------------------------------
        # Condition classification
        # --------------------------------

        if condition_score >= 75:

            condition = "Healthy"

        elif condition_score >= 50:

            condition = "Moderate"

        elif condition_score >= 25:

            condition = "At Risk"

        else:

            condition = "Critical"

        results.append({

            "habitat": habitat,

            "observations":
                observations,

            "species_count":
                species,

            "population":
                population,

            "species_score":
                round(
                    species_score,
                    2
                ),

            "population_score":
                round(
                    population_score,
                    2
                ),

            "monitoring_score":
                round(
                    monitoring_score,
                    2
                ),

            "condition_score":
                condition_score,

            "environmental_condition":
                condition

        })

    return results
def predict_habitat_suitability(db: Session):

    habitats = (
        db.query(
            Observation.location
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .distinct()
        .all()
    )

    results = []

    for habitat_row in habitats:

        habitat = habitat_row.location

        # --------------------------------
        # Observation statistics
        # --------------------------------

        data = (
            db.query(
                func.count(
                    Observation.id
                ).label("observations"),

                func.count(
                    func.distinct(
                        Observation.species_name
                    )
                ).label("species"),

                func.sum(
                    Observation.count
                ).label("population")
            )
            .filter(
                Observation.location == habitat
            )
            .first()
        )

        observations = int(
            data.observations or 0
        )

        species = int(
            data.species or 0
        )

        population = int(
            data.population or 0
        )

        # --------------------------------
        # Suitability indicators
        # --------------------------------

        biodiversity_score = min(
            species * 10,
            100
        )

        population_score = min(
            population,
            100
        )

        observation_score = min(
            observations * 5,
            100
        )

        # --------------------------------
        # Suitability score
        # --------------------------------

        suitability_score = (
            biodiversity_score * 0.45
            + population_score * 0.30
            + observation_score * 0.25
        )

        suitability_score = round(
            min(suitability_score, 100),
            2
        )

        # --------------------------------
        # Suitability classification
        # --------------------------------

        if suitability_score >= 75:

            suitability = "Highly Suitable"

        elif suitability_score >= 50:

            suitability = "Suitable"

        elif suitability_score >= 25:

            suitability = "Moderately Suitable"

        else:

            suitability = "Low Suitability"

        # --------------------------------
        # Recommendation
        # --------------------------------

        if suitability_score >= 75:

            recommendation = (
                "Habitat conditions appear suitable "
                "for continued wildlife conservation "
                "and monitoring."
            )

        elif suitability_score >= 50:

            recommendation = (
                "Habitat is suitable but continued "
                "monitoring is recommended."
            )

        elif suitability_score >= 25:

            recommendation = (
                "Habitat requires additional monitoring "
                "and conservation assessment."
            )

        else:

            recommendation = (
                "Habitat may require immediate "
                "conservation assessment."
            )

        results.append({

            "habitat": habitat,

            "observations":
                observations,

            "species_count":
                species,

            "population":
                population,

            "biodiversity_score":
                round(
                    biodiversity_score,
                    2
                ),

            "population_score":
                round(
                    population_score,
                    2
                ),

            "observation_score":
                round(
                    observation_score,
                    2
                ),

            "suitability_score":
                suitability_score,

            "suitability":
                suitability,

            "recommendation":
                recommendation

        })

    return results