from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import math

from database import get_db
import models


router = APIRouter(
    prefix="/biodiversity-intelligence",
    tags=["Biodiversity Intelligence"]
)


# =========================================================
# Biodiversity Dashboard
# =========================================================

@router.get("/dashboard")
def biodiversity_dashboard(
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Basic statistics
    # -----------------------------------------------------

    total_species = db.query(
        models.Species
    ).count()

    total_observations = db.query(
        models.Observation
    ).count()

    observed_species = db.query(
        func.count(
            func.distinct(models.Observation.species_id)
        )
    ).scalar() or 0

    endangered = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status == "Endangered"
    ).count()

    vulnerable = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status == "Vulnerable"
    ).count()

    critical = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status == "Critical"
    ).count()

    # -----------------------------------------------------
    # Species richness
    # Number of different species actually observed
    # -----------------------------------------------------

    species_richness = observed_species

    # -----------------------------------------------------
    # Species diversity
    #
    # Uses Shannon Diversity Index:
    #
    # H = - Σ (pi * ln(pi))
    #
    # where pi = population of species /
    #             total observed population
    # -----------------------------------------------------

    species_population_data = (
        db.query(
            models.Observation.species_id,
            func.sum(
                models.Observation.population_count
            ).label("population")
        )
        .group_by(
            models.Observation.species_id
        )
        .all()
    )

    total_observed_population = sum(
        item.population or 0
        for item in species_population_data
    )

    biodiversity_index = 0.0

    if total_observed_population > 0:

        for item in species_population_data:

            population = item.population or 0

            if population > 0:

                proportion = (
                    population /
                    total_observed_population
                )

                biodiversity_index -= (
                    proportion *
                    math.log(proportion)
                )

    biodiversity_index = round(
        biodiversity_index,
        3
    )

    # -----------------------------------------------------
    # Species diversity level
    # -----------------------------------------------------

    if biodiversity_index >= 2.5:
        diversity_level = "High"

    elif biodiversity_index >= 1.5:
        diversity_level = "Moderate"

    elif biodiversity_index > 0:
        diversity_level = "Low"

    else:
        diversity_level = "No Data"

    # -----------------------------------------------------
    # Conservation pressure
    #
    # Higher percentage of endangered/vulnerable species
    # means greater conservation concern.
    # -----------------------------------------------------

    conservation_concern_species = (
        endangered +
        vulnerable +
        critical
    )

    if total_species > 0:

        conservation_concern_percentage = round(
            (
                conservation_concern_species /
                total_species
            ) * 100,
            2
        )

    else:
        conservation_concern_percentage = 0

    # -----------------------------------------------------
    # Habitat health
    #
    # We currently do not have environmental measurements
    # in the database.
    #
    # Therefore calculate a DATA-BASED proxy using:
    #
    # - species diversity
    # - conservation pressure
    #
    # This is not a scientific habitat-quality score yet.
    # -----------------------------------------------------

    if total_species > 0:

        diversity_component = min(
            (observed_species / total_species) * 100,
            100
        )

        conservation_component = max(
            0,
            100 - conservation_concern_percentage
        )

        habitat_health = round(
            (
                diversity_component * 0.6
                +
                conservation_component * 0.4
            ),
            2
        )

    else:
        habitat_health = 0

    # -----------------------------------------------------
    # Habitat health status
    # -----------------------------------------------------

    if habitat_health >= 80:
        habitat_health_status = "Healthy"

    elif habitat_health >= 60:
        habitat_health_status = "Moderate"

    elif habitat_health >= 40:
        habitat_health_status = "Concern"

    else:
        habitat_health_status = "Critical"

    # -----------------------------------------------------
    # Conservation priority
    # -----------------------------------------------------

    if critical > 0 or endangered >= 3:

        conservation_priority = "Critical"

    elif endangered > 0 or vulnerable >= 3:

        conservation_priority = "High"

    elif vulnerable > 0:

        conservation_priority = "Moderate"

    else:

        conservation_priority = "Low"

    # -----------------------------------------------------
    # Return dashboard
    # -----------------------------------------------------

    return {
        "biodiversity_index": biodiversity_index,

        "species_diversity": diversity_level,

        "species_richness": species_richness,

        "habitat_health": habitat_health,

        "habitat_health_status":
            habitat_health_status,

        "endangered_species":
            endangered,

        "vulnerable_species":
            vulnerable,

        "critical_species":
            critical,

        "conservation_priority":
            conservation_priority,

        "conservation_concern_percentage":
            conservation_concern_percentage,

        "total_species":
            total_species,

        "total_observations":
            total_observations,

        "total_observed_population":
            total_observed_population
    }


# =========================================================
# Species Diversity Analysis
# =========================================================

@router.get("/species-diversity")
def species_diversity(
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
            models.Species.id ==
            models.Observation.species_id
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

    total_population = sum(
        item.population or 0
        for item in data
    )

    result = []

    for item in data:

        population = item.population or 0

        proportion = (
            population / total_population
            if total_population > 0
            else 0
        )

        result.append({
            "species_id":
                item.species_id,

            "species":
                item.species_name,

            "population":
                population,

            "proportion":
                round(proportion, 4)
        })

    return result


# =========================================================
# Biodiversity Index
# =========================================================

@router.get("/biodiversity-index")
def biodiversity_index(
    db: Session = Depends(get_db)
):

    data = (
        db.query(
            models.Observation.species_id,
            func.sum(
                models.Observation.population_count
            ).label("population")
        )
        .group_by(
            models.Observation.species_id
        )
        .all()
    )

    total_population = sum(
        item.population or 0
        for item in data
    )

    if total_population == 0:

        return {
            "biodiversity_index": 0,
            "method": "Shannon Diversity Index",
            "status": "No Data"
        }

    shannon_index = 0

    for item in data:

        population = item.population or 0

        if population > 0:

            proportion = (
                population /
                total_population
            )

            shannon_index -= (
                proportion *
                math.log(proportion)
            )

    shannon_index = round(
        shannon_index,
        3
    )

    return {
        "biodiversity_index":
            shannon_index,

        "species_count":
            len(data),

        "total_population":
            total_population,

        "method":
            "Shannon Diversity Index"
    }


# =========================================================
# Conservation Priority Analysis
# =========================================================

@router.get("/conservation-priority")
def conservation_priority(
    db: Session = Depends(get_db)
):

    species = db.query(
        models.Species
    ).all()

    result = []

    for item in species:

        status = (
            item.conservation_status or ""
        ).lower()

        # Priority score
        if status == "critical":
            priority_score = 100
            priority = "Critical"

        elif status == "endangered":
            priority_score = 80
            priority = "High"

        elif status == "vulnerable":
            priority_score = 60
            priority = "Moderate"

        elif status == "near threatened":
            priority_score = 40
            priority = "Moderate"

        else:
            priority_score = 20
            priority = "Low"

        # Observed population
        observed_population = db.query(
            func.sum(
                models.Observation.population_count
            )
        ).filter(
            models.Observation.species_id ==
            item.id
        ).scalar() or 0

        result.append({
            "species_id":
                item.id,

            "species":
                item.species_name,

            "conservation_status":
                item.conservation_status,

            "population":
                observed_population,

            "priority_score":
                priority_score,

            "priority":
                priority
        })

    # Highest priority first
    result.sort(
        key=lambda x: x["priority_score"],
        reverse=True
    )

    return result


# =========================================================
# Habitat Health Assessment
# =========================================================

@router.get("/habitat-health")
def habitat_health(
    db: Session = Depends(get_db)
):

    # Group species by habitat
    habitat_data = (
        db.query(
            models.Species.habitat,
            func.count(
                func.distinct(
                    models.Species.id
                )
            ).label("species_count")
        )
        .group_by(
            models.Species.habitat
        )
        .all()
    )

    result = []

    for item in habitat_data:

        habitat = item.habitat or "Unknown"

        species_count = (
            item.species_count or 0
        )

        # Get endangered species
        endangered_count = (
            db.query(models.Species)
            .filter(
                models.Species.habitat ==
                item.habitat,

                models.Species.conservation_status ==
                "Endangered"
            )
            .count()
        )

        # Simple data-based habitat score
        if endangered_count == 0:

            health_score = 90

        elif endangered_count <= 2:

            health_score = 70

        elif endangered_count <= 4:

            health_score = 50

        else:

            health_score = 30

        result.append({
            "habitat":
                habitat,

            "species_count":
                species_count,

            "endangered_species":
                endangered_count,

            "health_score":
                health_score
        })

    return result


# =========================================================
# Ecosystem Monitoring
# =========================================================

@router.get("/ecosystem-monitoring")
def ecosystem_monitoring(
    db: Session = Depends(get_db)
):

    total_species = db.query(
        models.Species
    ).count()

    total_observations = db.query(
        models.Observation
    ).count()

    total_population = db.query(
        func.sum(
            models.Observation.population_count
        )
    ).scalar() or 0

    habitats = db.query(
        func.count(
            func.distinct(
                models.Species.habitat
            )
        )
    ).scalar() or 0

    endangered = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status ==
        "Endangered"
    ).count()

    vulnerable = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status ==
        "Vulnerable"
    ).count()

    return {
        "total_species":
            total_species,

        "total_observations":
            total_observations,

        "total_population":
            total_population,

        "habitat_types":
            habitats,

        "endangered_species":
            endangered,

        "vulnerable_species":
            vulnerable,

        "ecosystem_monitoring_status":
            "Active"
            if total_observations > 0
            else "No Data"
    }