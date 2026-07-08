from datetime import date

from beanie import Document
from pydantic import BaseModel


class GPSCoordinates(BaseModel):
    latitude: float
    longitude: float


class MonitoringSite(Document):
    survey_id: str
    monitoring_location: str
    gps_coordinates: GPSCoordinates
    habitat_type: str
    survey_date: date
    monitoring_device: str
    protected_area: str

    class Settings:
        name = "monitoring_sites"