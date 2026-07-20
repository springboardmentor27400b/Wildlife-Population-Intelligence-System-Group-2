from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional
import pymongo

class AuditLog(Document):
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    module: str
    description: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    status: str  # Success or Failed
    severity: str  # INFO, WARNING, ERROR, SUCCESS
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "audit_logs"
        indexes = [
            "user_id",
            "module",
            "action",
            "status",
            "severity",
            pymongo.IndexModel([("timestamp", pymongo.DESCENDING)])
        ]
