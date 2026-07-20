from beanie import Document
from pydantic import Field
from datetime import datetime, timezone

class MonitoringSite(Document):
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "monitoring_sites"
