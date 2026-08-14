import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import HabitatType

class MonitoringSiteBase(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    habitat_type: HabitatType = HabitatType.OTHER
    survey_id: uuid.UUID

class MonitoringSiteCreate(MonitoringSiteBase):
    pass

class MonitoringSiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    habitat_type: Optional[HabitatType] = None

class MonitoringSiteResponse(MonitoringSiteBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
