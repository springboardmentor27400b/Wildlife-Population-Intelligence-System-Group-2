from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ChartDataPoint(BaseModel):
    month: str
    count: int
    is_prediction: Optional[bool] = False

class PopulationAnalysisResponse(BaseModel):
    population_density: float
    population_trend: str
    growth_rate_pct: float
    decline_rate_pct: float
    risk_level: str
    future_forecast: List[int]
    chart_data: List[ChartDataPoint]
    # New computed fields
    species_distribution: Optional[List[Dict[str, Any]]] = None
    top_species: Optional[List[str]] = None
    rare_species: Optional[List[str]] = None
    heatmap_data: Optional[List[Dict[str, Any]]] = None
    # Milestone 3 extended metrics
    total_species: Optional[int] = 0
    total_observations: Optional[int] = 0
    population_growth: Optional[float] = 0.0
    observation_growth: Optional[float] = 0.0
    rare_species_count: Optional[int] = 0
    most_observed_species: Optional[str] = "None"
    distribution_by_habitat: Optional[List[Dict[str, Any]]] = []
    distribution_by_site: Optional[List[Dict[str, Any]]] = []
