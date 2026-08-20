from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SensorDeviceBase(BaseModel):
    device_name: str = Field(..., min_length=2)
    device_id: Optional[str] = None
    device_type: Optional[str] = None
    monitoring_site_id: Optional[str] = None
    monitoring_site_name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    battery_level: Optional[float] = None
    last_active: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class SensorDeviceCreate(SensorDeviceBase):
    pass

class SensorDeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    device_id: Optional[str] = None
    device_type: Optional[str] = None
    monitoring_site_id: Optional[str] = None
    monitoring_site_name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    battery_level: Optional[float] = None
    last_active: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class SensorDeviceResponse(SensorDeviceBase):
    id: str
    created_at: datetime
    updated_at: datetime
