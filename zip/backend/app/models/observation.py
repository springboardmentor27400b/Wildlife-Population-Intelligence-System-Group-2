from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional

class ObservationRecord(Document):
    species_name: str
    scientific_name: Optional[str] = None
    observation_type: str
    monitoring_site_id: str
    monitoring_site_name: str
    sensor_device_id: Optional[str] = None
    sensor_device_name: Optional[str] = None
    field_upload_id: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    observed_at: datetime
    observer_id: str
    observer_name: str
    count: int = Field(default=1, ge=1)
    confidence_score: Optional[float] = Field(None, ge=0, le=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    verification_status: str = "Pending Validation"
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    prediction_source: Optional[str] = None
    prediction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "observation_records"
