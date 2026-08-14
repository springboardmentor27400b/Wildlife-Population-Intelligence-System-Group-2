import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.media import MediaResponse
from app.schemas.ai_prediction import AIPredictionResponse
from app.schemas.ai_analysis import AIAnalysisResponse

class ObservationBase(BaseModel):
    species: str
    count: int = Field(..., ge=1)
    observed_at: datetime
    latitude: float
    longitude: float
    notes: Optional[str] = None
    site_id: uuid.UUID

class ObservationCreate(ObservationBase):
    pass

class ObservationUpdate(BaseModel):
    species: Optional[str] = None
    count: Optional[int] = Field(None, ge=1)
    observed_at: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    site_id: Optional[uuid.UUID] = None

class ObservationResponse(ObservationBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    reporter_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    media: List[MediaResponse] = []
    ai_predictions: List[AIPredictionResponse] = []
    ai_status: str = "Not Started"
    ai_analyses: List[AIAnalysisResponse] = []
