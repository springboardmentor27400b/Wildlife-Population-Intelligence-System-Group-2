from typing import List, Optional
from pydantic import BaseModel

class EcologicalReportResponse(BaseModel):
    species_richness: int
    dominant_species: str
    rare_species: List[str]
    threatened_species: List[str]
    habitat_suitability_score: float
    predator_prey_ratio: Optional[float] = 0.0
    climate_impact_warning: Optional[str] = "Stable"
    human_conflict_level: str
    conservation_suggestions: List[str]
    # New computed fields
    biodiversity_index: Optional[float] = 0.0
    wildlife_health_score: Optional[float] = 0.0
    wildlife_health_status: Optional[str] = "Healthy"
    threatened_species_count: Optional[int] = 0
    observation_density: Optional[float] = 0.0
    habitat_health: Optional[str] = "Healthy"
    # Milestone 3 extended metrics
    species_diversity: Optional[float] = 0.0
    ecological_stability: Optional[str] = "Stable"
    trend_summary: Optional[str] = "Stable"
    habitat_quality: Optional[str] = "Good"
    wildlife_health_summary: Optional[str] = "Moderate Concern"
