from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId

class SensorDeviceBase(BaseModel):
    device_name: str = Field(..., min_length=2)
    device_id: str = Field(..., min_length=2)
    device_type: str
    monitoring_site_id: str
    monitoring_site_name: str
    location: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    status: str
    battery_level: int = Field(..., ge=0, le=100)
    last_active: str
    notes: Optional[str] = None

class SensorDeviceCreate(SensorDeviceBase):
    pass

class SensorDeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    monitoring_site_id: Optional[str] = None
    monitoring_site_name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    status: Optional[str] = None
    battery_level: Optional[int] = Field(None, ge=0, le=100)
    last_active: Optional[str] = None
    notes: Optional[str] = None

class SensorDeviceResponse(SensorDeviceBase):
    id: PydanticObjectId
    created_at: datetime
    updated_at: datetime
