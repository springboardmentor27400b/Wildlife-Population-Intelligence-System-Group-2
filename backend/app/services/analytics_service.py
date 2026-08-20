from sqlalchemy import func, distinct
from sqlalchemy.orm import Session

from app.models.species import Species
from app.models.wildlife_observation import WildlifeObservation
from app.models.protected_area import ProtectedArea
from app.services.ecosystem_health_history_service import (
    save_health_history,
)

def species_distribution(db: Session):

    result = (
        db.query(
            Species.common_name,
            func.sum(
                WildlifeObservation.animal_count
            )
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id
            == Species.id
        )
        .group_by(
            Species.common_name
        )
        .all()
    )

    return [
        {
            "species": row[0],
            "count": int(row[1] or 0)
        }
        for row in result
    ]


def biodiversity_by_habitat(db: Session):

    result = (
        db.query(
            ProtectedArea.area_type.label("habitat"),
            func.count(
                distinct(WildlifeObservation.species_id)
            ).label("richness")
        )
        .outerjoin(
            WildlifeObservation,
            WildlifeObservation.protected_area_id
            == ProtectedArea.id
        )
        .group_by(
            ProtectedArea.id,
            ProtectedArea.area_type
        )
        .order_by(
            ProtectedArea.area_type
        )
        .all()
    )

    return [
        {
            "habitat": row.habitat or "Unknown",
            "richness": int(row.richness or 0)
        }
        for row in result
    ]
def population_by_habitat(db: Session):

    result = (
        db.query(
            ProtectedArea.area_type,
            func.coalesce(
                func.sum(
                    WildlifeObservation.animal_count
                ),
                0
            ).label("population")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.protected_area_id
            == ProtectedArea.id
        )
        .group_by(
            ProtectedArea.area_type
        )
        .order_by(
            func.sum(
                WildlifeObservation.animal_count
            ).desc()
        )
        .all()
    )

    return [
        {
            "habitat": row[0],
            "population": int(row[1] or 0)
        }
        for row in result
    ]
def ecosystem_health(db: Session):

    # =========================================
    # 1. UNIQUE OBSERVED SPECIES
    # =========================================

    species_count = (
        db.query(
            func.count(
                distinct(
                    WildlifeObservation.species_id
                )
            )
        )
        .scalar()
        or 0
    )


    # =========================================
    # 2. TOTAL ANIMALS OBSERVED
    # =========================================

    total_animals = (
        db.query(
            func.sum(
                WildlifeObservation.animal_count
            )
        )
        .scalar()
        or 0
    )


    # =========================================
    # 3. PROTECTED AREA COUNT
    # =========================================

    protected_area_count = (
        db.query(
            func.count(
                ProtectedArea.id
            )
        )
        .scalar()
        or 0
    )


    # =========================================
    # 4. IUCN CONSERVATION STATUS
    # =========================================

    observed_species = (
        db.query(Species)
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id
            == Species.id
        )
        .distinct()
        .all()
    )


    endangered_count = 0

    for species in observed_species:

        status = (
            species.iucn_status
            or ""
        ).strip().lower()


        if status in [
            "critically endangered",
            "endangered",
            "vulnerable",
        ]:

            endangered_count += 1


    # =========================================
    # 5. CALCULATE BIODIVERSITY SCORE
    # =========================================

    biodiversity_score = min(
        species_count * 10,
        100
    )


    # =========================================
    # 6. CALCULATE POPULATION SCORE
    # =========================================

    population_score = min(
        total_animals,
        100
    )


    # =========================================
    # 7. CALCULATE HABITAT SCORE
    # =========================================

    habitat_score = min(
        protected_area_count * 20,
        100
    )


    # =========================================
    # 8. CALCULATE CONSERVATION SCORE
    # =========================================

    if species_count > 0:

        endangered_ratio = (
            endangered_count
            / species_count
        )

        conservation_score = round(
            (1 - endangered_ratio) * 100,
            1
        )

    else:

        conservation_score = 0


    # =========================================
    # 9. OVERALL HEALTH SCORE
    # =========================================

    overall = round(

        (
            biodiversity_score * 0.30
            + population_score * 0.25
            + habitat_score * 0.20
            + conservation_score * 0.25
        ),

        1

    )


    # =========================================
    # 10. HEALTH STATUS
    # =========================================

    if overall >= 80:

        status = "Excellent"

    elif overall >= 60:

        status = "Good"

    elif overall >= 40:

        status = "Moderate"

    else:

        status = "Poor"


    # =========================================
    # 11. RETURN RESULT
    # =========================================
    save_health_history(
    db=db,
    overall_score=overall,
    biodiversity_score=biodiversity_score,
    population_score=population_score,
    habitat_score=habitat_score,
    status=status,
)
    return {

        "overall": overall,

        "status": status,

        "parts": [

            {
                "label":
                    "Biodiversity",

                "weight":
                    30,

                "value":
                    biodiversity_score,
            },

            {
                "label":
                    "Population",

                "weight":
                    25,

                "value":
                    population_score,
            },

            {
                "label":
                    "Habitat Protection",

                "weight":
                    20,

                "value":
                    habitat_score,
            },

            {
                "label":
                    "Conservation Status",

                "weight":
                    25,

                "value":
                    conservation_score,
            },

        ],

        "metrics": {

            "species_count":
                species_count,

            "total_animals":
                int(total_animals),

            "protected_area_count":
                protected_area_count,

            "endangered_species_count":
                endangered_count,

        }

    }
def protected_area_analytics(db: Session):

    result = (
        db.query(
            ProtectedArea.id,
            ProtectedArea.name,
            func.count(WildlifeObservation.id).label("observations"),
            func.coalesce(
                func.sum(WildlifeObservation.animal_count), 0
            ).label("animals"),
            func.count(
                distinct(WildlifeObservation.species_id)
            ).label("species")
        )
        .outerjoin(
            WildlifeObservation,
            WildlifeObservation.protected_area_id == ProtectedArea.id
        )
        .group_by(
            ProtectedArea.id,
            ProtectedArea.name
        )
        .all()
    )

    analytics = []

    for area in result:

        if area.species >= 10:
            health = "Excellent"
        elif area.species >= 6:
            health = "Good"
        elif area.species >= 3:
            health = "Moderate"
        else:
            health = "Poor"

        analytics.append({
            "id": area.id,
            "area": area.name,
            "observations": int(area.observations),
            "animals": int(area.animals),
            "species": int(area.species),
            "health": health
        })

    return analytics
def population_stability(db: Session):

    # =========================================
    # GET TOTAL ANIMALS BY OBSERVATION DATE
    # =========================================

    result = (
        db.query(
            func.date(
                WildlifeObservation.observation_date
            ).label("observation_date"),

            func.sum(
                WildlifeObservation.animal_count
            ).label("total_animals")
        )
        .group_by(
            func.date(
                WildlifeObservation.observation_date
            )
        )
        .order_by(
            func.date(
                WildlifeObservation.observation_date
            )
        )
        .all()
    )


    # =========================================
    # CONVERT DATABASE RESULT
    # =========================================

    observations = [

        {
            "date": str(row.observation_date),

            "total_animals":
                int(row.total_animals or 0)
        }

        for row in result

    ]


    # =========================================
    # HANDLE INSUFFICIENT DATA
    # =========================================

    if len(observations) < 2:

        return {

            "trend":
                "Insufficient Data",

            "change_percent":
                0,

            "stability_score":
                50,

            "observations":
                observations

        }


    # =========================================
    # FIRST AND LAST POPULATION
    # =========================================

    first_count = (
        observations[0]["total_animals"]
    )

    last_count = (
        observations[-1]["total_animals"]
    )


    # =========================================
    # CALCULATE CHANGE
    # =========================================

    if first_count == 0:

        change_percent = 0

    else:

        change_percent = (

            (
                last_count
                - first_count
            )
            / first_count

        ) * 100


    change_percent = round(
        change_percent,
        2
    )


    # =========================================
    # DETERMINE POPULATION TREND
    # =========================================

    if change_percent > 10:

        trend = "Increasing"

        stability_score = 100


    elif change_percent < -10:

        trend = "Declining"

        stability_score = 20


    else:

        trend = "Stable"

        stability_score = 70


    # =========================================
    # RETURN RESULT
    # =========================================

    return {

        "trend":
            trend,

        "change_percent":
            change_percent,

        "stability_score":
            stability_score,

        "observations":
            observations

    }
from sqlalchemy import func

def get_monthly_observation_trends(db: Session):

    result = (
        db.query(
            func.extract("month", WildlifeObservation.observation_date).label("month"),
            func.sum(WildlifeObservation.animal_count).label("observations")
        )
        .group_by(
            func.extract("month", WildlifeObservation.observation_date)
        )
        .order_by(
            func.extract("month", WildlifeObservation.observation_date)
        )
        .all()
    )

    months = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ]

    chart = []

    for i in range(12):

        total = 0

        for row in result:
            if int(row.month) == i + 1:
                total = int(row.observations)

        chart.append({
            "month": months[i],
            "observations": total
        })

    return chart
def get_species_trends(db: Session):

    result = (
        db.query(
            Species.common_name,
            func.sum(WildlifeObservation.animal_count).label("total")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(Species.common_name)
        .order_by(func.sum(WildlifeObservation.animal_count).desc())
        .all()
    )

    return [
        {
            "species": row.common_name,
            "count": int(row.total)
        }
        for row in result
    ]
def conservation_status_distribution(db: Session):

    result = (
        db.query(
            Species.iucn_status,
            func.count(distinct(Species.id)).label("species_count")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.iucn_status
        )
        .order_by(
            Species.iucn_status
        )
        .all()
    )

    return [
        {
            "status": row[0] or "Unknown",
            "count": int(row[1] or 0)
        }
        for row in result
    ]


def conservation_species(db: Session):

    result = (
        db.query(
            Species.id,
            Species.common_name,
            Species.scientific_name,
            Species.iucn_status,
            func.coalesce(
                func.sum(WildlifeObservation.animal_count),
                0
            ).label("population")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.id,
            Species.common_name,
            Species.scientific_name,
            Species.iucn_status
        )
        .order_by(
            Species.iucn_status
        )
        .all()
    )

    return [
        {
            "id": row.id,
            "species": row.common_name,
            "scientific_name": row.scientific_name,
            "status": row.iucn_status or "Unknown",
            "population": int(row.population or 0)
        }
        for row in result
    ]
def conservation_species(db: Session):

    result = (
        db.query(
            Species.common_name,
            Species.iucn_status,
            func.sum(
                WildlifeObservation.animal_count
            ).label("population")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.id,
            Species.common_name,
            Species.iucn_status
        )
        .order_by(
            func.sum(
                WildlifeObservation.animal_count
            ).desc()
        )
        .all()
    )

    return [
        {
            "species": row.common_name,
            "status": row.iucn_status or "Unknown",
            "population": int(row.population or 0),
        }
        for row in result
    ]


def threatened_species(db: Session):

    result = (
        db.query(
            Species.common_name,
            Species.iucn_status,
            func.sum(
                WildlifeObservation.animal_count
            ).label("population")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .filter(
            Species.iucn_status.in_([
                "Critically Endangered",
                "Endangered",
                "Vulnerable",
            ])
        )
        .group_by(
            Species.id,
            Species.common_name,
            Species.iucn_status
        )
        .order_by(
            Species.iucn_status,
            func.sum(
                WildlifeObservation.animal_count
            ).desc()
        )
        .all()
    )

    return [
        {
            "species": row.common_name,
            "status": row.iucn_status or "Unknown",
            "population": int(row.population or 0),
        }
        for row in result
    ]


def conservation_recommendations(db: Session):

    recommendations = []

    # -----------------------------------------
    # Threatened species
    # -----------------------------------------

    threatened = (
        db.query(
            Species.common_name,
            Species.iucn_status,
            func.sum(
                WildlifeObservation.animal_count
            ).label("population")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .filter(
            Species.iucn_status.in_([
                "Critically Endangered",
                "Endangered",
                "Vulnerable",
            ])
        )
        .group_by(
            Species.id,
            Species.common_name,
            Species.iucn_status
        )
        .order_by(
            func.sum(
                WildlifeObservation.animal_count
            ).asc()
        )
        .all()
    )

    for row in threatened[:5]:

        if row.iucn_status == "Critically Endangered":
            priority = "Critical"
            impact = 95

        elif row.iucn_status == "Endangered":
            priority = "High"
            impact = 85

        else:
            priority = "Medium"
            impact = 70

        recommendations.append({
            "id": f"species-{row.common_name}",
            "title": f"Protect {row.common_name}",
            "detail": (
                f"{row.common_name} is classified as "
                f"{row.iucn_status}. Prioritize monitoring "
                f"and habitat protection."
            ),
            "category": "Species Protection",
            "priority": priority,
            "impact": impact,
        })

    # -----------------------------------------
    # Protected area monitoring
    # -----------------------------------------

    area_count = (
        db.query(
            func.count(ProtectedArea.id)
        )
        .scalar()
        or 0
    )

    if area_count > 0:

        recommendations.append({
            "id": "protected-area-monitoring",
            "title": "Strengthen Protected Area Monitoring",
            "detail": (
                "Increase wildlife monitoring and "
                "observation coverage across protected areas."
            ),
            "category": "Monitoring",
            "priority": "High",
            "impact": 80,
        })

    # -----------------------------------------
    # Habitat protection
    # -----------------------------------------

    habitat_count = (
        db.query(
            func.count(
                distinct(ProtectedArea.area_type)
            )
        )
        .scalar()
        or 0
    )

    if habitat_count > 0:

        recommendations.append({
            "id": "habitat-protection",
            "title": "Prioritize Habitat Protection",
            "detail": (
                "Maintain and restore important habitat "
                "types supporting wildlife populations."
            ),
            "category": "Habitat Restoration",
            "priority": "High",
            "impact": 82,
        })

    return recommendations
def conservation_status(db: Session):

    result = (
        db.query(
            Species.iucn_status,
            func.count(distinct(Species.id)).label("species_count")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.iucn_status
        )
        .order_by(
            Species.iucn_status
        )
        .all()
    )

    return [
        {
            "status": row.iucn_status or "Unknown",
            "count": int(row.species_count or 0),
        }
        for row in result
    ]
def conservation_recommendations(db: Session):

    observations = (
        db.query(
            Species.id,
            Species.common_name,
            Species.iucn_status,
            func.coalesce(
                func.sum(WildlifeObservation.animal_count),
                0
            ).label("population"),
        )
        .outerjoin(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.id,
            Species.common_name,
            Species.iucn_status
        )
        .all()
    )

    recommendations = []

    for row in observations:

        species_name = row.common_name or "Unknown Species"
        status = (row.iucn_status or "Unknown").strip()
        population = int(row.population or 0)

        status_lower = status.lower()

        # -----------------------------------------
        # DETERMINE PRIORITY
        # -----------------------------------------

        if status_lower == "critically endangered":
            priority = "Critical"
            impact = 100

            action = (
                f"Immediate protection and intensive monitoring "
                f"recommended for {species_name}."
            )

            category = "Species Protection"

        elif status_lower == "endangered":
            priority = "High"
            impact = 90

            action = (
                f"Increase monitoring and strengthen habitat "
                f"protection for {species_name}."
            )

            category = "Species Protection"

        elif status_lower == "vulnerable":
            priority = "Medium"
            impact = 70

            action = (
                f"Increase population monitoring and maintain "
                f"habitat protection for {species_name}."
            )

            category = "Population Monitoring"

        elif status_lower == "near threatened":
            priority = "Low"
            impact = 50

            action = (
                f"Continue regular monitoring of {species_name} "
                f"to detect population changes."
            )

            category = "Preventive Conservation"

        else:
            priority = "Low"
            impact = 30

            action = (
                f"Continue routine wildlife monitoring for "
                f"{species_name}."
            )

            category = "Monitoring"

        recommendations.append({
            "id": row.id,
            "species": species_name,
            "status": status,
            "population": population,
            "priority": priority,
            "impact": impact,
            "category": category,
            "recommendation": action,
        })

    # -----------------------------------------
    # HIGHEST PRIORITY FIRST
    # -----------------------------------------

    priority_order = {
        "Critical": 1,
        "High": 2,
        "Medium": 3,
        "Low": 4,
    }

    recommendations.sort(
        key=lambda item: (
            priority_order.get(item["priority"], 5),
            -item["population"],
        )
    )

    return recommendations
def get_conservation_status(db: Session):

    result = (
        db.query(
            Species.iucn_status,
            func.count(distinct(Species.id)).label("count")
        )
        .join(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.iucn_status
        )
        .order_by(
            Species.iucn_status
        )
        .all()
    )

    return [
        {
            "status": (
                row.iucn_status
                if row.iucn_status
                else "Unknown"
            ),
            "count": int(row.count or 0),
        }
        for row in result
    ]
def conservation_recommendations(db: Session):

    # Get observed species together with their total observed population
    result = (
        db.query(
            Species.id,
            Species.common_name,
            Species.iucn_status,
            func.coalesce(
                func.sum(WildlifeObservation.animal_count),
                0
            ).label("population")
        )
        .outerjoin(
            WildlifeObservation,
            WildlifeObservation.species_id == Species.id
        )
        .group_by(
            Species.id,
            Species.common_name,
            Species.iucn_status
        )
        .all()
    )

    recommendations = []

    for row in result:

        species_name = row.common_name or "Unknown Species"
        status = (row.iucn_status or "Unknown").strip()

        status_lower = status.lower()

        population = int(row.population or 0)

        # -----------------------------------------
        # CRITICALLY ENDANGERED
        # -----------------------------------------

        if status_lower == "critically endangered":

            recommendations.append({
                "species": species_name,
                "status": status,
                "population": population,
                "priority": "Critical",
                "category": "Species Protection",
                "title": f"Immediate protection required for {species_name}",
                "detail": (
                    f"{species_name} is classified as Critically Endangered. "
                    "Increase monitoring, strengthen habitat protection, "
                    "and investigate threats affecting the population."
                ),
                "impact": 100
            })

        # -----------------------------------------
        # ENDANGERED
        # -----------------------------------------

        elif status_lower == "endangered":

            recommendations.append({
                "species": species_name,
                "status": status,
                "population": population,
                "priority": "High",
                "category": "Species Protection",
                "title": f"Strengthen protection for {species_name}",
                "detail": (
                    f"{species_name} is classified as Endangered. "
                    "Increase field monitoring and prioritize habitat "
                    "protection and threat mitigation."
                ),
                "impact": 90
            })

        # -----------------------------------------
        # VULNERABLE
        # -----------------------------------------

        elif status_lower == "vulnerable":

            recommendations.append({
                "species": species_name,
                "status": status,
                "population": population,
                "priority": "Medium",
                "category": "Population Monitoring",
                "title": f"Monitor population of {species_name}",
                "detail": (
                    f"{species_name} is classified as Vulnerable. "
                    "Increase population monitoring and maintain "
                    "habitat protection measures."
                ),
                "impact": 75
            })

        # -----------------------------------------
        # NEAR THREATENED
        # -----------------------------------------

        elif status_lower == "near threatened":

            recommendations.append({
                "species": species_name,
                "status": status,
                "population": population,
                "priority": "Low",
                "category": "Preventive Conservation",
                "title": f"Prevent decline of {species_name}",
                "detail": (
                    f"{species_name} is Near Threatened. "
                    "Continue regular monitoring and preventative "
                    "habitat conservation."
                ),
                "impact": 60
            })

    # -----------------------------------------
    # SORT BY CONSERVATION PRIORITY
    # -----------------------------------------

    priority_order = {
        "Critical": 1,
        "High": 2,
        "Medium": 3,
        "Low": 4
    }

    recommendations.sort(
        key=lambda item: priority_order.get(
            item["priority"],
            99
        )
    )

    return recommendations