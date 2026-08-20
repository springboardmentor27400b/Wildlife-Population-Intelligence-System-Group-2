from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field


class MonitoringSite(Document):

    # ========================================================
    # SITE INFORMATION
    # ========================================================

    site_name: str

    location: str

    # ========================================================
    # GEOGRAPHIC INFORMATION
    # ========================================================

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

    # ========================================================
    # AREA INFORMATION
    # ========================================================

    area_km2: float = Field(
        gt=0,
        description="Monitoring area in square kilometers"
    )

    # ========================================================
    # HABITAT INFORMATION
    # ========================================================

    habitat_type: Optional[str] = None

    # ========================================================
    # PROTECTION STATUS
    # ========================================================

    protected_area: bool = False

    # ========================================================
    # TIMESTAMP
    # ========================================================

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # ========================================================
    # DATABASE SETTINGS
    # ========================================================

    class Settings:
        name = "monitoring_sites"