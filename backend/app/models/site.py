import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class MonitoringSite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_name: str
    location: str
    state: str
    district: str
    latitude: float
    longitude: float
    habitat_type: str
    area_sq_km: float
    description: str = ""
    status: str = "Active"
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

