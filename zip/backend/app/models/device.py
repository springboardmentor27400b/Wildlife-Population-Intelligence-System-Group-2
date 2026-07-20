from beanie import Document, Indexed
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional

class SensorDevice(Document):
    device_name: str
    device_id: Indexed(str, unique=True)
    device_type: str
    monitoring_site_id: str
    monitoring_site_name: str
    location: str
    latitude: float
    longitude: float
    status: str
    battery_level: int = Field(ge=0, le=100)
    last_active: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "sensor_devices"
