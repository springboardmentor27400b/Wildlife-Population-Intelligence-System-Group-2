from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MonitoringSiteCreate(BaseModel):
    site_name: str
    location: str
    state: str
    district: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    habitat_type: str
    area_sq_km: float = Field(..., gt=0)
    description: Optional[str] = ""
    status: str = "Active"

class MonitoringSiteUpdate(BaseModel):
    site_name: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    habitat_type: Optional[str] = None
    area_sq_km: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    status: Optional[str] = None

class MonitoringSiteResponse(BaseModel):
    id: str
    site_name: str
    location: str
    state: str
    district: str
    latitude: float
    longitude: float
    habitat_type: str
    area_sq_km: float
    description: str
    status: str
    created_by: str
    created_at: datetime
    updated_at: datetime
