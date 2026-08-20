from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter(
    prefix="/biodiversity",
    tags=["Biodiversity Analytics"]
)

# ----------------
# Dashbord
# ----------------
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    total_species = db.query(models.Species).count()

    total_observations = db.query(models.Observation).count()

    total_surveys = db.query(models.Survey).count()

    total_predictions = (
        db.query(models.ImageAnalysis).count() +
        db.query(models.AudioAnalysis).count()
    )

    return {
        "total_species": total_species,
        "total_observations": total_observations,
        "total_surveys": total_surveys,
        "total_predictions": total_predictions
    }

#------------------
# Observation History
#------------------

@router.get("/observation-history")
def observation_history(db: Session = Depends(get_db)):

    observations = db.query(models.Observation).all()

    data = []

    for obs in observations:

        data.append({
            "id": obs.id,
            "species": obs.species.species_name if obs.species else "Unknown",
            "location": obs.location,
            "population": obs.population_count,
            "date": obs.observation_date,
            "observer": obs.observer_name
        })

    return data

#------------------
# Prediction History
#------------------
@router.get("/prediction-history")
def prediction_history(db: Session = Depends(get_db)):

    image_predictions = db.query(models.ImageAnalysis).all()

    audio_predictions = db.query(models.AudioAnalysis).all()

    species_predictions = db.query(models.SpeciesClassification).all()

    return {
        "images": image_predictions,
        "audios": audio_predictions,
        "species": species_predictions
    }
