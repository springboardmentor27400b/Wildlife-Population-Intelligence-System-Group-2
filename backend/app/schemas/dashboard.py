from typing import Dict, List, Any
from pydantic import BaseModel

class SpeciesCount(BaseModel):
    species: str
    count: int

class HabitatCount(BaseModel):
    habitat_type: str
    count: int

class SightingTimeline(BaseModel):
    date: str
    count: int

class DashboardSummaryResponse(BaseModel):
    total_surveys: int
    total_sites: int
    total_devices: int
    active_devices: int
    total_observations: int
    total_analyses: int
    total_species_identified: int
    pending_analyses: int
    wildlife_health_score: int
    recent_observations: List[Any]
    species_breakdown: List[SpeciesCount]
    habitat_distribution: List[HabitatCount]
    sighting_timeline: List[SightingTimeline]
    device_statuses: Dict[str, int]
