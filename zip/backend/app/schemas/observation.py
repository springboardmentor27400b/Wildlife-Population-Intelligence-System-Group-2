from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from beanie import PydanticObjectId

class ObservationBase(BaseModel):
    species_name: str = Field(..., min_length=1)
    scientific_name: Optional[str] = None
    observation_type: str
    monitoring_site_id: str
    sensor_device_id: Optional[str] = None
    field_upload_id: Optional[str] = None
    observed_at: datetime
    count: int = Field(1, ge=1)
    confidence_score: Optional[float] = Field(None, ge=0, le=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    prediction_source: Optional[str] = None
    prediction_id: Optional[str] = None

class ObservationCreate(ObservationBase):
    pass

class ObservationUpdate(BaseModel):
    species_name: Optional[str] = Field(None, min_length=1)
    scientific_name: Optional[str] = None
    observation_type: Optional[str] = None
    monitoring_site_id: Optional[str] = None
    sensor_device_id: Optional[str] = None
    field_upload_id: Optional[str] = None
    observed_at: Optional[datetime] = None
    count: Optional[int] = Field(None, ge=1)
    confidence_score: Optional[float] = Field(None, ge=0, le=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None

class ObservationVerificationUpdate(BaseModel):
    status: str # "Verified" or "Rejected"

class ObservationResponse(ObservationBase):
    id: PydanticObjectId
    monitoring_site_name: str
    sensor_device_name: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    observer_id: str
    observer_name: str
    verification_status: str
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
