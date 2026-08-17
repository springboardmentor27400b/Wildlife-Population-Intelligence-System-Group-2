from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Observation


def generate_conservation_priorities(
    db: Session
):

    species_data = (
        db.query(
            Observation.species_name,

            func.count(
                Observation.id
            ).label("observations"),

            func.sum(
                Observation.count
            ).label("population"),

            func.count(
                func.distinct(
                    Observation.location
                )
            ).label("locations")
        )
        .filter(
            Observation.species_name.isnot(None),
            Observation.species_name != ""
        )
        .group_by(
            Observation.species_name
        )
        .all()
    )

    results = []

    for row in species_data:

        species = row.species_name

        observations = int(
            row.observations or 0
        )

        population = int(
            row.population or 0
        )

        locations = int(
            row.locations or 0
        )

        # --------------------------------
        # Population risk
        # --------------------------------

        if population <= 5:
            population_risk = 100

        elif population <= 10:
            population_risk = 80

        elif population <= 25:
            population_risk = 60

        elif population <= 50:
            population_risk = 35

        else:
            population_risk = 10

        # --------------------------------
        # Observation risk
        # --------------------------------

        if observations <= 2:
            observation_risk = 100

        elif observations <= 5:
            observation_risk = 70

        elif observations <= 10:
            observation_risk = 40

        else:
            observation_risk = 15

        # --------------------------------
        # Distribution risk
        # --------------------------------

        if locations <= 1:
            distribution_risk = 100

        elif locations == 2:
            distribution_risk = 70

        elif locations <= 4:
            distribution_risk = 40

        else:
            distribution_risk = 15

        # --------------------------------
        # Overall priority score
        # --------------------------------

        priority_score = (
            population_risk * 0.45
            +
            observation_risk * 0.30
            +
            distribution_risk * 0.25
        )

        priority_score = round(
            min(
                max(
                    priority_score,
                    0
                ),
                100
            ),
            2
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

        # --------------------------------
        # Recommendation
        # --------------------------------

        if priority == "Critical":

            recommendation = (
                f"Immediate protection and "
                f"intensive monitoring recommended "
                f"for {species}."
            )

        elif priority == "High":

            recommendation = (
                f"Increase monitoring and strengthen "
                f"protection measures for {species}."
            )

        elif priority == "Moderate":

            recommendation = (
                f"Continue regular monitoring and "
                f"evaluate habitat conditions for {species}."
            )

        else:

            recommendation = (
                f"Maintain routine monitoring for "
                f"{species}."
            )

        results.append({

            "species":
                species,

            "population":
                population,

            "observations":
                observations,

            "locations":
                locations,

            "population_risk":
                population_risk,

            "observation_risk":
                observation_risk,

            "distribution_risk":
                distribution_risk,

            "priority_score":
                priority_score,

            "priority":
                priority,

            "recommendation":
                recommendation

        })

    # Highest priority first

    results.sort(
        key=lambda x:
            x["priority_score"],
        reverse=True
    )

    return results
def generate_habitat_restoration_suggestions(
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
        .all()
    )

    results = []

    for row in habitats:

        habitat = row.location

        # --------------------------------
        # Habitat statistics
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
        # Calculate habitat indicators
        # --------------------------------

        biodiversity_score = min(
            species * 10,
            100
        )

        population_score = min(
            population,
            100
        )

        monitoring_score = min(
            observations * 5,
            100
        )

        habitat_health = (
            biodiversity_score * 0.45
            +
            population_score * 0.35
            +
            monitoring_score * 0.20
        )

        habitat_health = round(
            min(habitat_health, 100),
            2
        )

        # --------------------------------
        # Restoration priority
        # --------------------------------

        restoration_score = round(
            100 - habitat_health,
            2
        )

        if restoration_score >= 75:

            priority = "Critical"

        elif restoration_score >= 50:

            priority = "High"

        elif restoration_score >= 25:

            priority = "Moderate"

        else:

            priority = "Low"

        # --------------------------------
        # Dynamic restoration suggestions
        # --------------------------------

        suggestions = []

        if biodiversity_score < 50:

            suggestions.append(
                "Restore native vegetation to improve "
                "species diversity."
            )

        if population_score < 50:

            suggestions.append(
                "Improve habitat resources and reduce "
                "wildlife disturbance."
            )

        if monitoring_score < 50:

            suggestions.append(
                "Increase wildlife monitoring frequency "
                "in this habitat."
            )

        if not suggestions:

            suggestions.append(
                "Maintain current habitat protection "
                "and conservation activities."
            )

        # --------------------------------
        # Habitat-specific suggestions
        # --------------------------------

        habitat_name = habitat.lower()

        if (
            "forest" in habitat_name
            or "jungle" in habitat_name
            or "woodland" in habitat_name
        ):

            if restoration_score >= 50:

                suggestions.append(
                    "Prioritize native tree regeneration "
                    "and forest restoration."
                )

        elif (
            "grassland" in habitat_name
            or "savanna" in habitat_name
        ):

            if restoration_score >= 50:

                suggestions.append(
                    "Restore native grass cover and "
                    "protect open grazing areas."
                )

        elif (
            "wetland" in habitat_name
            or "lake" in habitat_name
            or "river" in habitat_name
            or "marsh" in habitat_name
        ):

            if restoration_score >= 50:

                suggestions.append(
                    "Protect water resources and restore "
                    "wetland vegetation."
                )

        elif (
            "mountain" in habitat_name
            or "hill" in habitat_name
        ):

            if restoration_score >= 50:

                suggestions.append(
                    "Control erosion and protect native "
                    "mountain vegetation."
                )

        results.append({

            "habitat":
                habitat,

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

            "monitoring_score":
                round(
                    monitoring_score,
                    2
                ),

            "habitat_health_score":
                habitat_health,

            "restoration_score":
                restoration_score,

            "priority":
                priority,

            "suggestions":
                suggestions

        })

    results.sort(
        key=lambda x:
            x["restoration_score"],
        reverse=True
    )

    return results
def generate_wildlife_protection_strategies(
    db: Session
):

    species_data = (
        db.query(
            Observation.species_name,

            func.count(
                Observation.id
            ).label("observations"),

            func.sum(
                Observation.count
            ).label("population"),

            func.count(
                func.distinct(
                    Observation.location
                )
            ).label("locations")
        )
        .filter(
            Observation.species_name.isnot(None),
            Observation.species_name != ""
        )
        .group_by(
            Observation.species_name
        )
        .all()
    )

    results = []

    for row in species_data:

        species = row.species_name

        observations = int(
            row.observations or 0
        )

        population = int(
            row.population or 0
        )

        locations = int(
            row.locations or 0
        )

        # --------------------------------
        # Risk indicators
        # --------------------------------

        if population <= 5:
            population_risk = 100
        elif population <= 10:
            population_risk = 80
        elif population <= 25:
            population_risk = 60
        elif population <= 50:
            population_risk = 35
        else:
            population_risk = 10

        if observations <= 2:
            monitoring_risk = 100
        elif observations <= 5:
            monitoring_risk = 70
        elif observations <= 10:
            monitoring_risk = 40
        else:
            monitoring_risk = 15

        if locations <= 1:
            distribution_risk = 100
        elif locations == 2:
            distribution_risk = 70
        elif locations <= 4:
            distribution_risk = 40
        else:
            distribution_risk = 15

        # --------------------------------
        # Protection priority
        # --------------------------------

        protection_score = (
            population_risk * 0.45
            +
            monitoring_risk * 0.30
            +
            distribution_risk * 0.25
        )

        protection_score = round(
            min(
                max(protection_score, 0),
                100
            ),
            2
        )

        # --------------------------------
        # Protection level
        # --------------------------------

        if protection_score >= 75:
            protection_level = "Critical"

        elif protection_score >= 50:
            protection_level = "High"

        elif protection_score >= 25:
            protection_level = "Moderate"

        else:
            protection_level = "Low"

        # --------------------------------
        # Dynamic strategies
        # --------------------------------

        strategies = []

        if population_risk >= 70:

            strategies.append(
                "Increase population monitoring "
                "and strengthen species protection."
            )

        if monitoring_risk >= 70:

            strategies.append(
                "Increase survey and observation "
                "frequency."
            )

        if distribution_risk >= 70:

            strategies.append(
                "Protect the limited habitats where "
                "the species is currently observed."
            )

        if population_risk >= 50:

            strategies.append(
                "Assess possible threats affecting "
                "population stability."
            )

        if protection_score >= 75:

            strategies.append(
                "Consider intensive conservation "
                "intervention and priority protection."
            )

        elif protection_score >= 50:

            strategies.append(
                "Maintain regular protection patrols "
                "and targeted monitoring."
            )

        else:

            strategies.append(
                "Continue routine monitoring and "
                "existing protection measures."
            )

        # --------------------------------
        # Recommendation
        # --------------------------------

        if protection_level == "Critical":

            recommendation = (
                f"Immediate protection action is "
                f"recommended for {species}."
            )

        elif protection_level == "High":

            recommendation = (
                f"Priority protection and increased "
                f"monitoring are recommended for {species}."
            )

        elif protection_level == "Moderate":

            recommendation = (
                f"Continue monitoring and evaluate "
                f"potential threats to {species}."
            )

        else:

            recommendation = (
                f"Maintain routine monitoring for "
                f"{species}."
            )

        results.append({

            "species":
                species,

            "population":
                population,

            "observations":
                observations,

            "locations":
                locations,

            "population_risk":
                population_risk,

            "monitoring_risk":
                monitoring_risk,

            "distribution_risk":
                distribution_risk,

            "protection_score":
                protection_score,

            "protection_level":
                protection_level,

            "strategies":
                strategies,

            "recommendation":
                recommendation

        })

    results.sort(
        key=lambda x:
            x["protection_score"],
        reverse=True
    )

    return results
def generate_monitoring_optimization(
    db: Session
):

    location_data = (
        db.query(
            Observation.location,

            func.count(
                Observation.id
            ).label("observations"),

            func.count(
                func.distinct(
                    Observation.species_name
                )
            ).label("species_count"),

            func.sum(
                Observation.count
            ).label("population")
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .group_by(
            Observation.location
        )
        .all()
    )

    results = []

    for row in location_data:

        location = row.location

        observations = int(
            row.observations or 0
        )

        species_count = int(
            row.species_count or 0
        )

        population = int(
            row.population or 0
        )

        # --------------------------------
        # Observation activity
        # --------------------------------

        if observations <= 2:

            observation_risk = 90

        elif observations <= 5:

            observation_risk = 70

        elif observations <= 10:

            observation_risk = 45

        elif observations <= 20:

            observation_risk = 25

        else:

            observation_risk = 10

        # --------------------------------
        # Species diversity
        # --------------------------------

        if species_count <= 1:

            diversity_risk = 80

        elif species_count <= 3:

            diversity_risk = 60

        elif species_count <= 5:

            diversity_risk = 35

        else:

            diversity_risk = 15

        # --------------------------------
        # Population pressure
        # --------------------------------

        if population <= 5:

            population_risk = 90

        elif population <= 15:

            population_risk = 70

        elif population <= 30:

            population_risk = 45

        elif population <= 60:

            population_risk = 25

        else:

            population_risk = 10

        # --------------------------------
        # Monitoring priority
        # --------------------------------

        monitoring_score = (

            observation_risk * 0.40

            +

            diversity_risk * 0.30

            +

            population_risk * 0.30

        )

        monitoring_score = round(
            min(
                max(
                    monitoring_score,
                    0
                ),
                100
            ),
            2
        )

        # --------------------------------
        # Monitoring level
        # --------------------------------

        if monitoring_score >= 75:

            monitoring_level = "Intensive"

        elif monitoring_score >= 50:

            monitoring_level = "High"

        elif monitoring_score >= 25:

            monitoring_level = "Regular"

        else:

            monitoring_level = "Routine"

        # --------------------------------
        # Monitoring frequency
        # --------------------------------

        if monitoring_level == "Intensive":

            frequency = (
                "Daily monitoring"
            )

        elif monitoring_level == "High":

            frequency = (
                "Monitoring every 2-3 days"
            )

        elif monitoring_level == "Regular":

            frequency = (
                "Weekly monitoring"
            )

        else:

            frequency = (
                "Monthly monitoring"
            )

        # --------------------------------
        # Monitoring methods
        # --------------------------------

        methods = []

        if population_risk >= 70:

            methods.append(
                "Camera trap monitoring"
            )

        if diversity_risk >= 60:

            methods.append(
                "Biodiversity survey"
            )

        if observation_risk >= 70:

            methods.append(
                "Increase field observation frequency"
            )

        if not methods:

            methods.append(
                "Routine wildlife monitoring"
            )

        # --------------------------------
        # Optimization recommendation
        # --------------------------------

        if monitoring_level == "Intensive":

            recommendation = (
                f"Deploy intensive monitoring "
                f"resources at {location}."
            )

        elif monitoring_level == "High":

            recommendation = (
                f"Increase monitoring coverage "
                f"and observation frequency at {location}."
            )

        elif monitoring_level == "Regular":

            recommendation = (
                f"Maintain regular monitoring "
                f"at {location}."
            )

        else:

            recommendation = (
                f"Routine monitoring is sufficient "
                f"for {location}."
            )

        results.append({

            "location":
                location,

            "observations":
                observations,

            "species_count":
                species_count,

            "population":
                population,

            "observation_risk":
                observation_risk,

            "diversity_risk":
                diversity_risk,

            "population_risk":
                population_risk,

            "monitoring_score":
                monitoring_score,

            "monitoring_level":
                monitoring_level,

            "recommended_frequency":
                frequency,

            "recommended_methods":
                methods,

            "recommendation":
                recommendation

        })

    results.sort(
        key=lambda x:
            x["monitoring_score"],
        reverse=True
    )

    return results
def generate_resource_allocation(
    db: Session
):

    location_data = (
        db.query(
            Observation.location,

            func.count(
                Observation.id
            ).label("observations"),

            func.count(
                func.distinct(
                    Observation.species_name
                )
            ).label("species_count"),

            func.sum(
                Observation.count
            ).label("population")
        )
        .filter(
            Observation.location.isnot(None),
            Observation.location != ""
        )
        .group_by(
            Observation.location
        )
        .all()
    )

    results = []

    for row in location_data:

        location = row.location

        observations = int(
            row.observations or 0
        )

        species_count = int(
            row.species_count or 0
        )

        population = int(
            row.population or 0
        )

        # --------------------------------
        # Risk calculations
        # --------------------------------

        if population <= 5:
            population_risk = 100
        elif population <= 15:
            population_risk = 75
        elif population <= 30:
            population_risk = 50
        elif population <= 60:
            population_risk = 25
        else:
            population_risk = 10

        if observations <= 2:
            monitoring_need = 100
        elif observations <= 5:
            monitoring_need = 75
        elif observations <= 10:
            monitoring_need = 50
        else:
            monitoring_need = 20

        if species_count <= 1:
            biodiversity_need = 80
        elif species_count <= 3:
            biodiversity_need = 60
        elif species_count <= 5:
            biodiversity_need = 35
        else:
            biodiversity_need = 15

        # --------------------------------
        # Resource priority
        # --------------------------------

        resource_priority = (
            population_risk * 0.40
            +
            monitoring_need * 0.35
            +
            biodiversity_need * 0.25
        )

        resource_priority = round(
            min(
                max(
                    resource_priority,
                    0
                ),
                100
            ),
            2
        )

        # --------------------------------
        # Allocation level
        # --------------------------------

        if resource_priority >= 75:

            allocation_level = "Very High"

        elif resource_priority >= 50:

            allocation_level = "High"

        elif resource_priority >= 25:

            allocation_level = "Moderate"

        else:

            allocation_level = "Low"

        # --------------------------------
        # Resource recommendations
        # --------------------------------

        resources = []

        if population_risk >= 70:

            resources.append(
                "Wildlife protection personnel"
            )

        if monitoring_need >= 70:

            resources.append(
                "Camera traps and monitoring equipment"
            )

        if biodiversity_need >= 60:

            resources.append(
                "Biodiversity survey teams"
            )

        if resource_priority >= 75:

            resources.append(
                "Priority conservation funding"
            )

        elif resource_priority >= 50:

            resources.append(
                "Additional field resources"
            )

        if not resources:

            resources.append(
                "Routine conservation resources"
            )

        # --------------------------------
        # Resource allocation percentage
        # --------------------------------

        allocation_percentage = round(
            resource_priority,
            2
        )

        # --------------------------------
        # Recommendation
        # --------------------------------

        if allocation_level == "Very High":

            recommendation = (
                f"Allocate maximum conservation "
                f"resources to {location}."
            )

        elif allocation_level == "High":

            recommendation = (
                f"Allocate additional monitoring "
                f"and protection resources to {location}."
            )

        elif allocation_level == "Moderate":

            recommendation = (
                f"Maintain moderate conservation "
                f"resource allocation at {location}."
            )

        else:

            recommendation = (
                f"Routine resource allocation is "
                f"sufficient for {location}."
            )

        results.append({

            "location":
                location,

            "observations":
                observations,

            "species_count":
                species_count,

            "population":
                population,

            "population_risk":
                population_risk,

            "monitoring_need":
                monitoring_need,

            "biodiversity_need":
                biodiversity_need,

            "resource_priority_score":
                resource_priority,

            "allocation_level":
                allocation_level,

            "allocation_percentage":
                allocation_percentage,

            "recommended_resources":
                resources,

            "recommendation":
                recommendation

        })

    results.sort(
        key=lambda x:
            x["resource_priority_score"],
        reverse=True
    )

    return results