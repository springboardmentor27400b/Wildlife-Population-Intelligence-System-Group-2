from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models


router = APIRouter(
    prefix="/conservation",
    tags=["Conservation Recommendation Engine"]
)


# =========================================================
# CONSERVATION RECOMMENDATION ENGINE
# =========================================================

@router.get("/")
def recommendations(
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

    endangered_species = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status == "Endangered"
    ).all()

    vulnerable_species = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status == "Vulnerable"
    ).all()

    critical_species = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status == "Critical"
    ).all()


    # =====================================================
    # 1. CONSERVATION PRIORITY
    # =====================================================

    priority_recommendations = []

    if critical_species:

        priority_recommendations.append(
            "Critical conservation priority detected. "
            "Immediately increase monitoring and protection "
            "for critically threatened species."
        )

    if endangered_species:

        species_names = [
            species.species_name
            for species in endangered_species
        ]

        priority_recommendations.append(
            "Prioritize endangered species: "
            + ", ".join(species_names)
            + "."
        )

    if vulnerable_species:

        species_names = [
            species.species_name
            for species in vulnerable_species
        ]

        priority_recommendations.append(
            "Increase monitoring of vulnerable species: "
            + ", ".join(species_names)
            + "."
        )

    if not critical_species and not endangered_species:

        priority_recommendations.append(
            "No critical or endangered species currently "
            "identified in the database. Continue regular monitoring."
        )


    # =====================================================
    # 2. HABITAT RESTORATION
    # =====================================================

    habitat_recommendations = []

    habitat_data = (
        db.query(
            models.Species.habitat,
            func.count(
                models.Observation.id
            ).label("observation_count")
        )
        .join(
            models.Observation,
            models.Species.id ==
            models.Observation.species_id
        )
        .group_by(
            models.Species.habitat
        )
        .all()
    )

    if not habitat_data:

        habitat_recommendations.append(
            "Add more field observations to assess habitat conditions."
        )

    else:

        for habitat, observation_count in habitat_data:

            habitat = habitat or "Unknown"

            if observation_count < 5:

                habitat_recommendations.append(
                    f"Increase monitoring and habitat assessment "
                    f"in {habitat} habitat."
                )

            elif observation_count < 15:

                habitat_recommendations.append(
                    f"Consider habitat restoration assessment "
                    f"for {habitat} habitat."
                )

            else:

                habitat_recommendations.append(
                    f"Continue regular habitat monitoring in "
                    f"{habitat} habitat."
                )


    # =====================================================
    # 3. WILDLIFE PROTECTION
    # =====================================================

    protection_recommendations = []

    if critical_species or endangered_species:

        protection_recommendations.append(
            "Strengthen wildlife protection measures in areas "
            "where threatened species are observed."
        )

        protection_recommendations.append(
            "Increase anti-poaching and illegal wildlife activity "
            "monitoring in sensitive zones."
        )

    else:

        protection_recommendations.append(
            "Maintain existing wildlife protection and "
            "anti-poaching monitoring."
        )


    # =====================================================
    # 4. MONITORING OPTIMIZATION
    # =====================================================

    monitoring_recommendations = []

    if total_observations < 10:

        monitoring_recommendations.append(
            "Observation coverage is low. Increase the frequency "
            "of wildlife surveys."
        )

    elif total_observations < 30:

        monitoring_recommendations.append(
            "Moderate observation coverage detected. "
            "Increase monitoring in under-observed areas."
        )

    else:

        monitoring_recommendations.append(
            "Observation coverage is good. Maintain regular "
            "monitoring schedules."
        )


    # -----------------------------------------------------
    # Check locations with few observations
    # -----------------------------------------------------

    location_data = (
        db.query(
            models.Observation.location,
            func.count(
                models.Observation.id
            ).label("count")
        )
        .group_by(
            models.Observation.location
        )
        .all()
    )

    for location, count in location_data:

        if count <= 2:

            monitoring_recommendations.append(
                f"Increase monitoring frequency at "
                f"{location} because observation coverage is low."
            )


    # =====================================================
    # 5. RESOURCE ALLOCATION
    # =====================================================

    resource_recommendations = []

    if critical_species:

        resource_recommendations.append(
            "Allocate the highest conservation resources "
            "to critical species and their habitats."
        )

    if endangered_species:

        resource_recommendations.append(
            "Allocate additional field staff, monitoring "
            "equipment, and protection resources to endangered "
            "species."
        )

    if vulnerable_species:

        resource_recommendations.append(
            "Reserve monitoring resources for vulnerable species "
            "to prevent further population decline."
        )

    if total_observations < 20:

        resource_recommendations.append(
            "Allocate additional resources for field surveys, "
            "camera traps, GPS monitoring, and observation collection."
        )

    else:

        resource_recommendations.append(
            "Current observation data supports continued "
            "monitoring resource allocation."
        )


    # =====================================================
    # 6. GENERAL CONSERVATION ACTIONS
    # =====================================================

    general_recommendations = [

        "Protect important wildlife habitats from degradation.",

        "Continue regular biodiversity monitoring.",

        "Maintain accurate population and observation records.",

        "Use AI-based image and audio analysis to improve "
        "wildlife monitoring efficiency."

    ]


    # =====================================================
    # COMBINE RECOMMENDATIONS
    # =====================================================

    all_recommendations = (
        priority_recommendations
        +
        habitat_recommendations
        +
        protection_recommendations
        +
        monitoring_recommendations
        +
        resource_recommendations
        +
        general_recommendations
    )


    # Remove duplicate recommendations
    all_recommendations = list(
        dict.fromkeys(all_recommendations)
    )


    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {

        "total_species":
            total_species,

        "total_observations":
            total_observations,

        "critical_species":
            len(critical_species),

        "endangered_species":
            len(endangered_species),

        "vulnerable_species":
            len(vulnerable_species),

        "recommendation_count":
            len(all_recommendations),

        "recommendations":
            all_recommendations

    }


# =========================================================
# CONSERVATION PRIORITY
# =========================================================

@router.get("/priority")
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

        if status == "critical":

            score = 100
            priority = "Critical"

        elif status == "endangered":

            score = 80
            priority = "High"

        elif status == "vulnerable":

            score = 60
            priority = "Moderate"

        elif status == "near threatened":

            score = 40
            priority = "Moderate"

        else:

            score = 20
            priority = "Low"


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

            "observed_population":
                observed_population,

            "priority_score":
                score,

            "priority":
                priority

        })


    result.sort(
        key=lambda x: x["priority_score"],
        reverse=True
    )


    return result


# =========================================================
# MONITORING OPTIMIZATION
# =========================================================

@router.get("/monitoring")
def monitoring_optimization(
    db: Session = Depends(get_db)
):

    location_data = (
        db.query(
            models.Observation.location,
            func.count(
                models.Observation.id
            ).label("observation_count")
        )
        .group_by(
            models.Observation.location
        )
        .all()
    )

    result = []

    for location, count in location_data:

        if count <= 2:

            priority = "High"

        elif count <= 5:

            priority = "Medium"

        else:

            priority = "Low"


        result.append({

            "location":
                location,

            "observation_count":
                count,

            "monitoring_priority":
                priority

        })


    result.sort(
        key=lambda x: x["observation_count"]
    )


    return result


# =========================================================
# RESOURCE ALLOCATION
# =========================================================

@router.get("/resources")
def resource_allocation(
    db: Session = Depends(get_db)
):

    critical = db.query(
        models.Species
    ).filter(
        models.Species.conservation_status ==
        "Critical"
    ).count()

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


    if critical > 0:

        resource_level = "Very High"

    elif endangered > 0:

        resource_level = "High"

    elif vulnerable > 0:

        resource_level = "Moderate"

    else:

        resource_level = "Normal"


    return {

        "critical_species":
            critical,

        "endangered_species":
            endangered,

        "vulnerable_species":
            vulnerable,

        "recommended_resource_level":
            resource_level

    }
