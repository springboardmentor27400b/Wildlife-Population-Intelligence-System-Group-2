import uuid
from pydantic import Field, BaseModel
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

class AnimalDetection(BaseModel):
    species: str
    confidence: float
    bbox: List[float]  # [x_min, y_min, x_max, y_max] relative percentages (0-100)
    behaviour: str = "Unknown"
class TopPrediction(BaseModel):
    species: str
    confidence: float

class PredictionRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # ── Core prediction fields ─────────────────────────────────────────────
    species_name: str
    confidence_score: float
    prediction_time: Optional[float] = None
    prediction_timestamp: Optional[datetime] = None  # exact UTC time the model ran
    model_version: str = "1.0.0"
    top_3_predictions: List[TopPrediction] = Field(default_factory=list)
    top_predictions: List[TopPrediction] = Field(default_factory=list)

    # ── Image metadata ─────────────────────────────────────────────────────
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    image_file_name: Optional[str] = None
    image_url: Optional[str] = None
    image_width: Optional[int] = None   # original image width in pixels
    image_height: Optional[int] = None  # original image height in pixels
    
    # ── Advanced ML features ───────────────────────────────────────────────
    image_source: str = "Camera Trap"  # Camera Trap | Drone
    image_quality: str = "Good"        # Excellent | Good | Fair | Poor
    quality_metrics: Dict[str, Any] = Field(default_factory=dict)
    detection_source: str = "Simulation" # Simulation | YOLO | Faster R-CNN
    animal_count: int = 1
    detections: List[AnimalDetection] = Field(default_factory=list)

    # ── Workflow / linking fields ──────────────────────────────────────────
    status: str = "Pending"         # Pending | Saved | Discarded
    observation_id: Optional[str] = None  # set when linked to an ObservationRecord

    # ── Location (optional, for future GPS-aware predictions) ─────────────
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # ── User info ─────────────────────────────────────────────────────────
    user_id: str
    user_name: str

    # ── Timestamps ────────────────────────────────────────────────────────
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

