import uuid
from typing import Optional

def to_uuid(val: str) -> Optional[uuid.UUID]:
    """Parse string to UUID safely."""
    try:
        return uuid.UUID(val)
    except (ValueError, TypeError, AttributeError):
        return None

def format_datetime(dt) -> Optional[str]:
    """Format datetime to ISO format string."""
    if dt:
        return dt.isoformat()
    return None
