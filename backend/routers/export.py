from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
import models

import pandas as pd
import os

router = APIRouter(
    prefix="/export",
    tags=["Export"]
)

@router.get("/observations/excel")
def export_observations(db: Session = Depends(get_db)):

    observations = db.query(models.Observation).all()

    data = []

    for obs in observations:

        data.append({

            "ID": obs.id,

            "Species": obs.species.species_name if obs.species else "",

            "Location": obs.location,

            "Population": obs.population_count,

            "Observer": obs.observer_name,

            "Date": obs.observation_date

        })

    df = pd.DataFrame(data)

    os.makedirs("exports", exist_ok=True)

    path = "exports/observations.xlsx"

    df.to_excel(path, index=False)

    return FileResponse(
        path,
        filename="Observation_History.xlsx"
    )

@router.get("/predictions/excel")
def export_predictions(db: Session = Depends(get_db)):

    predictions = db.query(models.SpeciesClassification).all()

    data = []

    for p in predictions:

        data.append({

            "Species": p.common_name,

            "Scientific Name": p.scientific_name,

            "Confidence": p.confidence,

            "Status": p.conservation_status

        })

    df = pd.DataFrame(data)

    os.makedirs("exports", exist_ok=True)

    path = "exports/predictions.xlsx"

    df.to_excel(path, index=False)

    return FileResponse(
        path,
        filename="Prediction_History.xlsx"
    )