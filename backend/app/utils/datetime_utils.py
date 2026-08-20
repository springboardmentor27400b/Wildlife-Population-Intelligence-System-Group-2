"""
Centralized Backend DateTime Utility for Timezone-Aware ISO 8601 UTC Serialization
"""
from datetime import datetime, timezone


def format_iso_utc(dt: datetime | str | None, det_date: str | None = None, det_time: str | None = None) -> str | None:
    """
    Ensures a datetime object or string is formatted as a timezone-aware ISO 8601 UTC string.
    Example: 2026-08-16T18:47:55Z
    """
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    if det_date and det_time:
        d = str(det_date).strip()
        t = str(det_time).strip()
        if d and t:
            return f"{d}T{t}Z"

    if isinstance(dt, str):
        s = dt.strip()
        if not s:
            return None
        s = s.replace(" at ", " ").replace(" AT ", " ").strip()
        if "T" in s:
            if not s.endswith("Z") and not ("+" in s[10:] or "-" in s[10:]):
                return f"{s}Z"
            return s
        if " " in s:
            parts = s.split(" ")
            if len(parts) == 2 and "-" in parts[0] and ":" in parts[1]:
                return f"{parts[0]}T{parts[1]}Z"
        return s

    return None
