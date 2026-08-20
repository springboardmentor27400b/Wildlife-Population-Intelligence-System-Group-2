import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Dict, Any, Optional

class ReportHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    """
    Logs metadata about generated reports. Does not store actual file content.
    """
    report_type: str = Field(..., description="The type of report generated")
    user_id: str = Field(..., description="ID of the user who generated the report")
    user_name: str = Field(..., description="Name of the user")
    generated_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    filters: Dict[str, Any] = Field(default_factory=dict, description="Filters applied to the report")
    export_format: str = Field(..., description="Format exported (e.g., PDF, Excel, JSON, CSV)")
    status: str = Field(default="Completed", description="Status of generation")

