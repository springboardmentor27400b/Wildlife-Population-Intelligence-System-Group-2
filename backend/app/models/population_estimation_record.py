import uuid
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

class PopulationEstimationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    species_name: str = Field(..., description="Name of the species")
    scientific_name: Optional[str] = Field(None, description="Scientific name")
    monitoring_site_name: str = Field(..., description="Monitoring site associated with this estimate")
    estimated_population: float = Field(0.0, description="Estimated population count")
    confidence_score: float = Field(0.0, description="Overall confidence score for the estimate")
    growth_trend: float = Field(0.0, description="Percentage growth from previous period")
    statistics: Dict[str, Any] = Field(default_factory=dict, description="Additional breakdown statistics (verified vs AI counts)")
    timestamp: datetime = Field(default_factory=lambda: datetime.utcnow(), description="When this estimate was calculated")
    calculation_date: str = Field(..., description="The specific date string (YYYY-MM-DD) this estimate applies to")

