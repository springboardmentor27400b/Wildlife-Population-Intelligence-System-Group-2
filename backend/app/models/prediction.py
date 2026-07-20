from beanie import Document
from pydantic import Field, BaseModel
from datetime import datetime, timezone
from typing import Optional, List

class TopPrediction(BaseModel):
    species: str
    confidence: float

class PredictionRecord(Document):
    species_name: str
    confidence_score: float
    prediction_time: float
    model_version: str = "1.0.0"
    top_3_predictions: List[TopPrediction] = Field(default_factory=list)
    file_name: str
    file_url: str
    status: str = "Pending"  # Pending, Saved, Discarded
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user_id: str
    user_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "prediction_records"
