import uuid
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict
from app.schemas.species_profile import SpeciesProfileResponse

class AIPredictionBase(BaseModel):
    media_id: Optional[uuid.UUID] = None
    observation_id: Optional[uuid.UUID] = None
    species_profile_id: Optional[uuid.UUID] = None
    detection_count: int
    detection_time_ms: float
    annotated_image_url: Optional[str] = None
    raw_json_response: Optional[dict] = None

class AIPredictionCreate(AIPredictionBase):
    pass

class AIPredictionResponse(AIPredictionBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    species_profile: Optional[SpeciesProfileResponse] = None
