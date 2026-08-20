from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models

router = APIRouter(
    prefix="/habitat",
    tags=["Habitat Intelligence"]
)


# =========================================================
# HABITAT DASHBOARD
# =========================================================

@router.get("/")
def habitat_dashboard(db: Session = Depends(get_db)):

    observations = db.query(models.Observation).all()

    if not observations:
        return {
            "habitat_type": "Unknown",
            "total_observations": 0,
            "vegetation_score": 0,
            "degradation_score": 0,
            "environmental_condition": "No Data",
            "habitat_suitability": 0,
            "habitat_health": "No Data"
        }

    # -----------------------------------------------------
    # Total observations
    # -----------------------------------------------------

    total_observations = len(observations)

    # -----------------------------------------------------
    # Habitat type
    # -----------------------------------------------------
    # Take habitat information from Species table

    habitat_counts = (
        db.query(
            models.Species.habitat,
            func.count(models.Species.id)
        )
        .join(
            models.Observation,
            models.Species.id == models.Observation.species_id
        )
        .group_by(models.Species.habitat)
        .all()
    )

    if habitat_counts:

        habitat_type = max(
            habitat_counts,
            key=lambda x: x[1]
        )[0]

    else:
        habitat_type = "Unknown"


    # -----------------------------------------------------
    # Vegetation Score
    # -----------------------------------------------------
    # Based on number of observations.
    # More observations indicate better monitoring/
    # vegetation presence for now.

    vegetation_score = min(
        100,
        total_observations * 10
    )


    # -----------------------------------------------------
    # Habitat Degradation
    # -----------------------------------------------------

    degradation_score = max(
        0,
        100 - vegetation_score
    )


    # -----------------------------------------------------
    # Habitat Suitability
    # -----------------------------------------------------

    habitat_suitability = (
        vegetation_score * 0.7
        +
        (100 - degradation_score) * 0.3
    )


    # -----------------------------------------------------
    # Habitat Health
    # -----------------------------------------------------

    if habitat_suitability >= 80:

        habitat_health = "Excellent"

    elif habitat_suitability >= 60:

        habitat_health = "Healthy"

    elif habitat_suitability >= 40:

        habitat_health = "Moderate Concern"

    elif habitat_suitability >= 20:

        habitat_health = "Vulnerable"

    else:

        habitat_health = "Critical"


    # -----------------------------------------------------
    # Environmental Condition
    # -----------------------------------------------------

    if habitat_suitability >= 80:

        environmental_condition = "Good"

    elif habitat_suitability >= 50:

        environmental_condition = "Moderate"

    else:

        environmental_condition = "Poor"


    return {

        "habitat_type": habitat_type,

        "total_observations": total_observations,

        "vegetation_score": round(
            vegetation_score,
            2
        ),

        "degradation_score": round(
            degradation_score,
            2
        ),

        "environmental_condition":
            environmental_condition,

        "habitat_suitability": round(
            habitat_suitability,
            2
        ),

        "habitat_health":
            habitat_health

    }


# =========================================================
# HABITAT CLASSIFICATION
# =========================================================

@router.get("/classification")
def habitat_classification(
    db: Session = Depends(get_db)
):

    result = (
        db.query(
            models.Species.habitat,
            func.count(models.Observation.id)
        )
        .join(
            models.Observation,
            models.Species.id == models.Observation.species_id
        )
        .group_by(models.Species.habitat)
        .all()
    )

    return [

        {
            "habitat": habitat,
            "observation_count": count
        }

        for habitat, count in result

    ]


# =========================================================
# HABITAT DEGRADATION
# =========================================================

@router.get("/degradation")
def habitat_degradation(
    db: Session = Depends(get_db)
):

    observations = db.query(
        models.Observation
    ).count()

    if observations == 0:

        return {
            "degradation_score": 0,
            "status": "No Data"
        }

    vegetation_score = min(
        100,
        observations * 10
    )

    degradation_score = max(
        0,
        100 - vegetation_score
    )

    if degradation_score <= 20:

        status = "Low Degradation"

    elif degradation_score <= 50:

        status = "Moderate Degradation"

    else:

        status = "High Degradation"


    return {

        "degradation_score":
            round(degradation_score, 2),

        "status":
            status

    }


# =========================================================
# VEGETATION ANALYSIS
# =========================================================

@router.get("/vegetation")
def vegetation_analysis(
    db: Session = Depends(get_db)
):

    total_observations = db.query(
        models.Observation
    ).count()

    if total_observations == 0:

        return {
            "vegetation_score": 0,
            "status": "No Data"
        }

    vegetation_score = min(
        100,
        total_observations * 10
    )

    if vegetation_score >= 80:

        status = "Healthy Vegetation"

    elif vegetation_score >= 50:

        status = "Moderate Vegetation"

    else:

        status = "Low Vegetation"


    return {

        "vegetation_score":
            round(vegetation_score, 2),

        "status":
            status

    }


# =========================================================
# ENVIRONMENTAL CONDITION
# =========================================================

@router.get("/environment")
def environmental_condition(
    db: Session = Depends(get_db)
):

    total_observations = db.query(
        models.Observation
    ).count()

    if total_observations == 0:

        return {
            "condition": "No Data",
            "score": 0
        }

    score = min(
        100,
        total_observations * 10
    )

    if score >= 80:

        condition = "Good"

    elif score >= 50:

        condition = "Moderate"

    else:

        condition = "Poor"


    return {

        "condition": condition,

        "score": round(score, 2)

    }


# =========================================================
# HABITAT SUITABILITY
# =========================================================

@router.get("/suitability")
def habitat_suitability(
    db: Session = Depends(get_db)
):

    total_observations = db.query(
        models.Observation
    ).count()

    if total_observations == 0:

        return {
            "suitability_score": 0,
            "status": "No Data"
        }

    vegetation_score = min(
        100,
        total_observations * 10
    )

    degradation_score = max(
        0,
        100 - vegetation_score
    )

    suitability = (
        vegetation_score * 0.7
        +
        (100 - degradation_score) * 0.3
    )

    if suitability >= 80:

        status = "Highly Suitable"

    elif suitability >= 60:

        status = "Suitable"

    elif suitability >= 40:

        status = "Moderately Suitable"

    else:

        status = "Low Suitability"


    return {

        "suitability_score":
            round(suitability, 2),

        "status":
            status

    }