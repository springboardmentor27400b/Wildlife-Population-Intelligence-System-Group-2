from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MonitoringSiteCreate(BaseModel):

    # ========================================================
    # SITE INFORMATION
    # ========================================================

    site_name: str

    location: str

    # ========================================================
    # GPS COORDINATES
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
    # AREA
    # ========================================================

    area_km2: float = Field(
        gt=0
    )

    # ========================================================
    # HABITAT
    # ========================================================

    habitat_type: Optional[str] = None

    # ========================================================
    # PROTECTION
    # ========================================================

    protected_area: bool = False


class MonitoringSiteResponse(BaseModel):

    id: str

    site_name: str

    location: str

    latitude: Optional[float] = None

    longitude: Optional[float] = None

    area_km2: float

    habitat_type: Optional[str] = None

    protected_area: bool

    created_at: datetime