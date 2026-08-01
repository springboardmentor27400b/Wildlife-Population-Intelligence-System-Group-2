from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime

class EcosystemHealthOut(BaseModel):
    id: int
    recorded_date: date
    species_richness: int
    shannon_index: float
    evenness_index: float
    habitat_quality_score: float
    population_stability: float
    threat_level: float
    protected_species_count: int
    invasive_species_count: int
    overall_health_score: float
    grade: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EcosystemSummaryResponse(BaseModel):
    current_health: Optional[EcosystemHealthOut] = None
    trend_description: str
    grade: str

    model_config = ConfigDict(from_attributes=True)
