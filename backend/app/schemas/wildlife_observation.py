from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WildlifeObservationCreate(BaseModel):
    species_id: int

    protected_area_id: int

    latitude: float

    longitude: float

    animal_count: int

    observation_type: str

    image_path: str | None = None

    notes: str | None = None
class WildlifeObservationResponse(BaseModel):
    id: int

    species_id: int
    protected_area_id: int
    observer_id: int

    observation_date: datetime

    latitude: float
    longitude: float

    animal_count: int

    observation_type: Optional[str]

    image_path: Optional[str]

    notes: Optional[str]

    class Config:
        from_attributes = True