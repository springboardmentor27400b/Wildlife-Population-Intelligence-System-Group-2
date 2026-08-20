import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class SensorDevice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_name: str
    device_type: Optional[str] = None
    monitoring_site_id: str
    monitoring_site_name: Optional[str] = None
    status: str
    battery_level: Optional[float] = Field(default=None, ge=0, le=100)
    last_active: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    
