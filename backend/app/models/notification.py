from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional
import pymongo

class Notification(Document):
    title: str
    message: str
    type: str  # observation, prediction, report, site, sensor, alert, info
    priority: str  # High, Medium, Low, Success
    user_id: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    related_resource_id: Optional[str] = None

    class Settings:
        name = "notifications"
        indexes = [
            "user_id",
            "created_at",
            "is_read",
            pymongo.IndexModel(
                [("user_id", pymongo.ASCENDING), ("is_read", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)]
            )
        ]
