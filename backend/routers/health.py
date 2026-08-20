from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models


router = APIRouter(
    prefix="/health",
    tags=["Wildlife Health Scoring Engine"]
)


# =========================================================
# WILDLIFE HEALTH SCORING ENGINE
# =========================================================

@router.get("/")
def ecosystem_health(
    db: Session = Depends(get_db)
):

    # =====================================================
    # BASIC DATA
    # =====================================================

    total_species = db.query(
        models.Species
    ).count()

    total_observations = db.query(
        models.Observation
    ).count()


    # =====================================================
    # 1. SPECIES DIVERSITY SCORE - 30%
    # =====================================================

    # Based on number of different species present.
    #
    # 10 or more species = 100
    # 5 species = 50
    # 0 species = 0

    if total_species == 0:

        biodiversity_score = 0

    else:

        biodiversity_score = min(
            100,
            total_species * 10
        )


    # =====================================================
    # 2. POPULATION STABILITY SCORE - 25%
    # =====================================================

    # Use population counts from observations.
    #
    # More reliable monitoring requires observations
    # across different species and dates.

    population_counts = (
        db.query(
            models.Observation.population_count
        )
        .filter(
            models.Observation.population_count.isnot(None)
        )
        .all()
    )

    if not population_counts:

        population_score = 0

    else:

        counts = [
            item[0]
            for item in population_counts
            if item[0] is not None
        ]

        if not counts:

            population_score = 0

        else:

            average_population = (
                sum(counts) / len(counts)
            )

            # Normalize population monitoring.
            #
            # Average observed population of 50+
            # represents strong population stability
            # in this prototype.

            population_score = min(
                100,
                average_population * 2
            )


    # =====================================================
    # 3. HABITAT QUALITY SCORE - 20%
    # =====================================================

    # Determine how many different habitat types
    # are actually represented in observations.

    habitat_data = (
        db.query(
            models.Species.habitat
        )
        .join(
            models.Observation,
            models.Species.id ==
            models.Observation.species_id
        )
        .filter(
            models.Species.habitat.isnot(None)
        )
        .distinct()
        .all()
    )

    habitat_count = len(habitat_data)

    if habitat_count == 0:

        habitat_score = 0

    else:

        # 5 or more monitored habitats = 100

        habitat_score = min(
            100,
            habitat_count * 20
        )


    # =====================================================
    # 4. ENDANGERED SPECIES STATUS SCORE - 15%
    # =====================================================

    endangered_species = db.query(
        models.Species
    ).filter(
        func.lower(
            models.Species.conservation_status
        ) == "endangered"
    ).count()


    critical_species = db.query(
        models.Species
    ).filter(
        func.lower(
            models.Species.conservation_status
        ) == "critical"
    ).count()


    vulnerable_species = db.query(
        models.Species
    ).filter(
        func.lower(
            models.Species.conservation_status
        ) == "vulnerable"
    ).count()


    if total_species == 0:

        conservation_score = 0

    else:

        # Critical species have the highest negative impact.
        # Endangered species have medium impact.
        # Vulnerable species have lower impact.

        threat_score = (

            critical_species * 1.0

            +

            endangered_species * 0.75

            +

            vulnerable_species * 0.50

        )

        threat_percentage = (
            threat_score / total_species
        ) * 100

        conservation_score = max(
            0,
            100 - threat_percentage
        )


    # =====================================================
    # 5. ENVIRONMENTAL CONDITIONS SCORE - 10%
    # =====================================================

    # Current Observation model does not contain:
    #
    # temperature
    # humidity
    # rainfall
    # air quality
    # water quality
    #
    # Therefore we cannot calculate actual environmental
    # conditions yet.
    #
    # For now, use monitoring coverage as a proxy.

    if total_observations == 0:

        environmental_score = 0

    else:

        # 20+ observations = 100

        environmental_score = min(
            100,
            total_observations * 5
        )


    # =====================================================
    # WEIGHTED ECOSYSTEM HEALTH SCORE
    # =====================================================

    overall_score = (

        biodiversity_score * 0.30

        +

        population_score * 0.25

        +

        habitat_score * 0.20

        +

        conservation_score * 0.15

        +

        environmental_score * 0.10

    )

    overall_score = round(
        overall_score,
        2
    )


    # =====================================================
    # CONSERVATION STATUS
    # =====================================================

    if overall_score >= 90:

        status = "Excellent"

    elif overall_score >= 75:

        status = "Healthy"

    elif overall_score >= 60:

        status = "Moderate Concern"

    elif overall_score >= 40:

        status = "Vulnerable"

    else:

        status = "Critical"


    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {

        "biodiversity": round(
            biodiversity_score,
            2
        ),

        "population": round(
            population_score,
            2
        ),

        "habitat": round(
            habitat_score,
            2
        ),

        "conservation": round(
            conservation_score,
            2
        ),

        "environmental_conditions": round(
            environmental_score,
            2
        ),

        "overall": overall_score,

        "status": status,

        # Additional information

        "total_species": total_species,

        "total_observations": total_observations,

        "endangered_species": endangered_species,

        "critical_species": critical_species,

        "vulnerable_species": vulnerable_species,

        "habitat_count": habitat_count

    }


# =========================================================
# HEALTH SCORE BREAKDOWN
# =========================================================

@router.get("/breakdown")
def health_score_breakdown(
    db: Session = Depends(get_db)
):

    result = ecosystem_health(db)

    return {

        "weights": {

            "species_diversity": 30,

            "population_stability": 25,

            "habitat_quality": 20,

            "endangered_species_status": 15,

            "environmental_conditions": 10

        },

        "scores": {

            "species_diversity":
                result["biodiversity"],

            "population_stability":
                result["population"],

            "habitat_quality":
                result["habitat"],

            "endangered_species_status":
                result["conservation"],

            "environmental_conditions":
                result["environmental_conditions"]

        },

        "overall_score":
            result["overall"],

        "status":
            result["status"]

    }


# =========================================================
# CONSERVATION STATUS
# =========================================================

@router.get("/status")
def health_status(
    db: Session = Depends(get_db)
):

    result = ecosystem_health(db)

    return {

        "overall_score":
            result["overall"],

        "status":
            result["status"]

    }
