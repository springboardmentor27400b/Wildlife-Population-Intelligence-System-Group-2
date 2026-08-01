from beanie import Document
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


class AudioPredictionRecord(Document):
    # ── Core prediction fields ─────────────────────────────────────────────
    species_name: str
    confidence_score: float
    prediction_time: float          # wall-clock seconds for inference
    prediction_timestamp: Optional[datetime] = None  # exact UTC time the model ran
    model_version: str = "1.0.0"
    top_3_predictions: List[TopPrediction] = Field(default_factory=list)
    top_predictions: List[TopPrediction] = Field(default_factory=list)

    # ── Audio metadata ─────────────────────────────────────────────────────
    file_name: str
    file_url: str
    duration_seconds: Optional[float] = None
    sample_rate: Optional[int] = None
    channels: int = 1
    audio_quality: str = "Good"       # Excellent | Good | Fair | Poor
    noise_level_db: float = 0.0       # Signal-to-noise ratio in dB
    clipping_detected: bool = False
    silence_percentage: float = 0.0
    
    # ── Acoustic Events ────────────────────────────────────────────────────
    detection_source: str = "Estimated" # Estimated | BirdNET | YAMNet | Custom TensorFlow
    event_count: int = 0
    events: List[AcousticEvent] = Field(default_factory=list)

    # ── Workflow / linking fields ──────────────────────────────────────────
    status: str = "Pending"         # Pending | Saved | Discarded
    observation_id: Optional[str] = None  # set when linked to an ObservationRecord

    # ── User info ─────────────────────────────────────────────────────────
    user_id: str
    user_name: str

    # ── Timestamps ────────────────────────────────────────────────────────
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "audio_prediction_records"
