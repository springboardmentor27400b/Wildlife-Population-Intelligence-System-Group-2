from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field


class Wildlife(Document):

    # ========================================================
    # BASIC WILDLIFE INFORMATION
    # ========================================================

    species_name: str

    count: int

    location: str

    # ========================================================
    # HEALTH & CONSERVATION
    # ========================================================

    health_status: Optional[str] = "Not Evaluated"

    conservation_status: Optional[str] = "Not Evaluated"

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

    # When the wildlife was observed
    observed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Monitoring site where the animal was observed
    monitoring_site: Optional[str] = None

    # GPS coordinates
    latitude: Optional[float] = None

    longitude: Optional[float] = None

    # ========================================================
    # DATABASE SETTINGS
    # ========================================================

    class Settings:
        name = "wildlife"