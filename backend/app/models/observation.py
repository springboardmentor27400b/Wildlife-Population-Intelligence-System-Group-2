import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class ObservationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    species_name: Optional[str] = None
    scientific_name: Optional[str] = None
    observation_type: Optional[str] = None
    monitoring_site_id: Optional[str] = None
    monitoring_site_name: Optional[str] = None
    sensor_device_id: Optional[str] = None
    sensor_device_name: Optional[str] = None
    field_upload_id: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    observed_at: Optional[str] = None
    observer_id: Optional[str] = None
    observer_name: Optional[str] = None
    count: Optional[int] = Field(default=1, ge=1)
    confidence_score: Optional[float] = Field(None, ge=0, le=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    verification_status: str = "Pending Validation"
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    prediction_source: Optional[str] = None
    prediction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    
