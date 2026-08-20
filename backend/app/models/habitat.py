from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field


class Habitat(Document):

    # ========================================================
    # BASIC INFORMATION
    # ========================================================

    location: str

    habitat_type: str

    # ========================================================
    # HABITAT INFORMATION
    # ========================================================

    area_km2: Optional[float] = None

    protected_area: bool = False

    # ========================================================
    # ENVIRONMENTAL INFORMATION
    # These will be used by Modules 8.2 - 8.5
    # ========================================================

    temperature: Optional[float] = None

    rainfall: Optional[float] = None

    vegetation_health: Optional[float] = None

    water_quality: Optional[float] = None

    # ========================================================
    # CLASSIFICATION
    # ========================================================

    classification_confidence: Optional[float] = 0.0

    classification_method: str = "Rule-Based Classification"

    # ========================================================
    # TIMESTAMP
    # ========================================================

    recorded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # ========================================================
    # DATABASE SETTINGS
    # ========================================================

    class Settings:
        name = "habitat"