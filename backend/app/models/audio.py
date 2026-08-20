from datetime import datetime
from typing import List

from beanie import Document
from pydantic import BaseModel, Field


class Prediction(BaseModel):
    label: str
    confidence: float
    scientific_name: str = ""


class BirdPrediction(BaseModel):
    species: str
    scientific_name: str = ""
    confidence: float


class AudioUpload(Document):
    filename: str
    filepath: str

    uploaded_by: str

    uploaded_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    # YAMNet predictions
    predictions: List[Prediction] = Field(
        default_factory=list
    )

    # BirdNET predictions
    bird_predictions: List[BirdPrediction] = Field(
        default_factory=list
    )

    analysis_status: str = "Pending"

    class Settings:
        name = "audio_uploads"