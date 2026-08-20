from datetime import date
from typing import Optional
from pydantic import BaseModel


class ObservationOut(BaseModel):
    id: int
    species_name: str
    scientific_name: Optional[str] = "Unknown"
    site_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    observation_date: date
    observer_name: Optional[str] = "Field Researcher"
    count: int
    confidence: Optional[float] = 0.95
    status: Optional[str] = "Verified"
