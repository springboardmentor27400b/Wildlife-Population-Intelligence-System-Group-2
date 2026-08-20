import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Dict, Any, Optional

class AdvancedAnalyticsCache(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    """
    Optional optimization layer to store cached snapshots of heavy analytical queries.
    Maintains backward compatibility by acting purely as a cache.
    """
    query_hash: str = Field(..., description="Hash of the query parameters")
    payload: Dict[str, Any] = Field(..., description="The calculated analytics payload")
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    expires_at: datetime = Field(..., description="When this cache entry should be invalidated")

