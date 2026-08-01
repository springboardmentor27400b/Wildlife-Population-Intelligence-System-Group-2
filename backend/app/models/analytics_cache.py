from pydantic import Field
from beanie import Document
from datetime import datetime, timezone
from typing import Dict, Any, Optional

class AdvancedAnalyticsCache(Document):
    """
    Optional optimization layer to store cached snapshots of heavy analytical queries.
    Maintains backward compatibility by acting purely as a cache.
    """
    query_hash: str = Field(..., description="Hash of the query parameters")
    payload: Dict[str, Any] = Field(..., description="The calculated analytics payload")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(..., description="When this cache entry should be invalidated")

    class Settings:
        name = "advanced_analytics_cache"
        indexes = [
            "query_hash",
            "expires_at"
        ]
