from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class HabitatAnalysisOut(BaseModel):
    id: int
    habitat_name: str
    location: Optional[str] = None
    suitability_score: Optional[float] = None
    water_availability: Optional[float] = None
    vegetation_density: Optional[float] = None
    temperature_celsius: Optional[float] = None
    rainfall_mm: Optional[float] = None
    human_disturbance: Optional[float] = None
    quality_score: Optional[float] = None
    degradation_level: Optional[float] = None
    risk_level: Optional[str] = None
    species_count: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_km2: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class HabitatRiskOut(BaseModel):
    id: int
    habitat_name: str
    risk_category: str
    risk_score: float
    primary_threat: Optional[str] = None
    affected_species: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class MigrationCorridorOut(BaseModel):
    id: int
    corridor_name: str
    from_habitat: str
    to_habitat: str
    species: str
    distance_km: Optional[float] = None
    risk_level: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class HabitatSummaryResponse(BaseModel):
    total_habitats: int
    average_quality: float
    critical_habitats: int
    analyses: List[HabitatAnalysisOut]

    model_config = ConfigDict(from_attributes=True)
