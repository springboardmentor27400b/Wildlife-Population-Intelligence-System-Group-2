import uuid
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.species_profile import SpeciesProfileResponse

class AIAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    observation_id: uuid.UUID
    image_completed: bool
    audio_completed: bool
    image_json: Optional[dict] = None
    audio_json: Optional[dict] = None
    status: str
    created_at: datetime
    updated_at: datetime
    species_profile: Optional[SpeciesProfileResponse] = None
