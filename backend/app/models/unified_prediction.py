from beanie import Document
from pydantic import Field, BaseModel
from datetime import datetime, timezone
from typing import Optional


class UnifiedPredictionRecord(Document):
    # ── Standard Prediction Fields ─────────────────────────────────────────
    species_name: str
    confidence_score: float
    prediction_source: str           # "Image" or "Audio"
    prediction_timestamp: datetime
    model_name: str
    model_version: str

    # ── Biological Enrichment Data ────────────────────────────────────────
    scientific_name: Optional[str] = None
    taxonomy: Optional[dict] = None
    family: Optional[str] = None
    category: Optional[str] = None
    conservation_status: Optional[str] = None
    habitat: Optional[str] = None
    diet: Optional[str] = None
    average_lifespan: Optional[str] = None
    average_weight: Optional[str] = None
    geographic_distribution: Optional[str] = None
    brief_description: Optional[str] = None
    typical_behaviour: Optional[str] = None
    active_time: Optional[str] = None
    population_trend: Optional[str] = None
    average_height: Optional[str] = None
    length: Optional[str] = None
    speed: Optional[str] = None
    predators: Optional[str] = None
    prey: Optional[str] = None
    reproduction: Optional[str] = None
    interesting_facts: Optional[str] = None
    native_regions: Optional[str] = None
    climate: Optional[str] = None
    food_chain_level: Optional[str] = None
    endemic_status: Optional[str] = None
    protected_areas: Optional[str] = None
    scientific_reference_url: Optional[str] = None
    
    # ── Advanced Prediction Metadata ───────────────────────────────────────
    top_predictions: list = Field(default_factory=list)
    explanation: Optional[str] = None
    similar_species: list = Field(default_factory=list)
    inference_time: Optional[float] = None
    prediction_engine: Optional[str] = None

    # ── References ────────────────────────────────────────────────────────
    source_record_id: str            # ID of the underlying PredictionRecord or AudioPredictionRecord
    observation_id: Optional[str] = None
    user_id: str
    user_name: str

    # ── Workflow ──────────────────────────────────────────────────────────
    status: str = "Pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "unified_prediction_records"
