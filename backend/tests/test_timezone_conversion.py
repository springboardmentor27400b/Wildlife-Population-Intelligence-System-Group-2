"""
Unit & Integration Tests for UTC Storage & Timezone-Aware ISO Serialization
"""
from datetime import datetime, timezone
import pytest
from app.utils.datetime_utils import format_iso_utc


def test_utc_naive_datetime_serialization():
    """Test naive datetime object (UTC in DB) formats to ISO 8601 ending in Z."""
    dt = datetime(2026, 8, 16, 18, 47, 55)
    iso = format_iso_utc(dt)
    assert iso == "2026-08-16T18:47:55Z"


def test_utc_aware_datetime_serialization():
    """Test timezone-aware UTC datetime formats correctly."""
    dt = datetime(2026, 8, 16, 18, 47, 55, tzinfo=timezone.utc)
    iso = format_iso_utc(dt)
    assert iso == "2026-08-16T18:47:55Z"


def test_string_timestamp_without_offset():
    """Test raw space-separated or un-suffixed string receives Z suffix."""
    s1 = "2026-08-16 18:47:55"
    assert format_iso_utc(s1) == "2026-08-16T18:47:55Z"

    s2 = "2026-08-16T18:47:55"
    assert format_iso_utc(s2) == "2026-08-16T18:47:55Z"


def test_legacy_string_with_at_keyword():
    """Test string containing 'at' keyword strips 'at' and formats to ISO Z."""
    s = "2026-08-16 at 18:47:55"
    assert format_iso_utc(s) == "2026-08-16T18:47:55Z"


def test_detection_date_time_fallback():
    """Test fallback combining separate detection_date and detection_time."""
    iso = format_iso_utc(None, det_date="2026-08-16", det_time="18:47:55")
    assert iso == "2026-08-16T18:47:55Z"


def test_none_and_invalid_timestamp():
    """Test null or empty timestamps return None safely."""
    assert format_iso_utc(None) is None
    assert format_iso_utc("") is None
    assert format_iso_utc("   ") is None


def test_utc_to_ist_midnight_crossing_concept():
    """Verify UTC 18:47:55 on 16 Aug crosses midnight to 00:17:55 (17 Aug) in IST (+5:30)."""
    dt_utc = datetime(2026, 8, 16, 18, 47, 55, tzinfo=timezone.utc)
    from datetime import timedelta
    dt_ist = dt_utc + timedelta(hours=5, minutes=30)
    assert dt_ist.day == 17
    assert dt_ist.month == 8
    assert dt_ist.hour == 0
    assert dt_ist.minute == 17
