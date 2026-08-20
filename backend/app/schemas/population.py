from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class PopulationStatOut(BaseModel):
    id: int
    species: str
    common_name: Optional[str] = None
    estimated_count: int
    habitat: Optional[str] = None
    location: Optional[str] = None
    confidence_score: Optional[float] = None
    male_count: Optional[int] = None
    female_count: Optional[int] = None
    juvenile_count: Optional[int] = None
    adult_count: Optional[int] = None
    growth_rate: Optional[float] = None
    density_per_km2: Optional[float] = None
    habitat_area_km2: Optional[float] = None
    recorded_date: Optional[date] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class PopulationTrendOut(BaseModel):
    id: int
    species: str
    month: int
    year: int
    count: int
    growth_rate: Optional[float] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class PopulationDensityOut(BaseModel):
    id: int
    habitat_name: str
    species: str
    density: float
    area_km2: float
    population_count: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class PopulationSummaryResponse(BaseModel):
    total_population: int
    species_count: int
    average_growth_rate: float
    top_species: List[str]
    stats: List[PopulationStatOut]
    
    model_config = ConfigDict(from_attributes=True)
