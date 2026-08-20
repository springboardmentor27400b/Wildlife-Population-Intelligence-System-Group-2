import uuid
from pydantic import Field, BaseModel
from datetime import datetime, timezone
from typing import Optional, List

class TopPrediction(BaseModel):
    species: str
    confidence: float

class AcousticEvent(BaseModel):
    start_time: float
    end_time: float
    duration: float
    label: str
    confidence: float

class AudioPredictionRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # ── Core prediction fields ─────────────────────────────────────────────
    species_name: str
    confidence_score: float
    prediction_time: Optional[float] = None
    prediction_timestamp: Optional[datetime] = None  # exact UTC time the model ran
    model_version: str = "1.0.0"
    top_3_predictions: List[TopPrediction] = Field(default_factory=list)
    top_predictions: List[TopPrediction] = Field(default_factory=list)

    # ── Audio metadata ─────────────────────────────────────────────────────
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    audio_file_name: Optional[str] = None
    duration_seconds: Optional[float] = None
    sample_rate: Optional[int] = None
    channels: int = 1
    # ── Acoustic Events ────────────────────────────────────────────────────
    # (Removed acoustic events and metadata fields as they are not in Supabase)

    # ── Workflow / linking fields ──────────────────────────────────────────
    status: str = "Pending"         # Pending | Saved | Discarded
    observation_id: Optional[str] = None  # set when linked to an ObservationRecord

    # ── User info ─────────────────────────────────────────────────────────
    user_id: Optional[str] = None
    user_name: Optional[str] = None

    # ── Timestamps ────────────────────────────────────────────────────────
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

