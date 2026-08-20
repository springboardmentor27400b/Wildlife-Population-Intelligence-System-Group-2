from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class WildlifeCreate(BaseModel):

    # ========================================================
    # BASIC WILDLIFE INFORMATION
    # ========================================================

    species_name: str

    count: int = Field(
        gt=0,
        description="Number of animals observed"
    )

    location: str

    # ========================================================
    # HEALTH & CONSERVATION
    # ========================================================

    health_status: str

    conservation_status: Optional[str] = (
        "Not Evaluated"
    )

    # ========================================================
    # BEHAVIOR
    # ========================================================

    behavior: Optional[str] = "Unknown"

    behavior_confidence: Optional[float] = 0.0

    detection_confidence: Optional[float] = 0.0

    # ========================================================
    # IMAGE
    # ========================================================

    image_url: Optional[str] = None

    # ========================================================
    # POPULATION INTELLIGENCE
    # ========================================================

    observed_at: Optional[datetime] = None

    monitoring_site: Optional[str] = None

    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90
    )

    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180
    )