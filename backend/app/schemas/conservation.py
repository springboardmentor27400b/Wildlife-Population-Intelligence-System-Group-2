from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ConservationRecommendationOut(BaseModel):
    id: int
    species: Optional[str] = None
    habitat: Optional[str] = None
    category: str
    title: str
    recommendation: str
    reason: str
    expected_impact: Optional[str] = None
    priority: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ConservationGenerateRequest(BaseModel):
    species: Optional[str] = None
    habitat: Optional[str] = None
    trigger: Optional[str] = None
