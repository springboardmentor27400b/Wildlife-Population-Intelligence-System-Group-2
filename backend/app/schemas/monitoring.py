from datetime import date

from pydantic import BaseModel


class GPSCoordinates(BaseModel):
    latitude: float
    longitude: float


class MonitoringCreate(BaseModel):
    survey_id: str
    monitoring_location: str
    gps_coordinates: GPSCoordinates
    habitat_type: str
    survey_date: date
    monitoring_device: str
    protected_area: str