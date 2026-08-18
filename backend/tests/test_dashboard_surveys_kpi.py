import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.sql import Survey, User
from app.api.endpoints.dashboard import get_user_dashboard_stats
from unittest.mock import MagicMock

def test_dashboard_active_surveys_kpi_matching_survey_management():
    db = SessionLocal()
    try:
        # Fetch an arbitrary user for current_user dependency mock
        test_user = db.query(User).first()
        assert test_user is not None

        # Clean up existing test surveys created by automated testing
        db.query(Survey).filter(Survey.title.like("KPI Test Survey%")).delete(synchronize_session=False)
        db.commit()

        # Get initial state
        all_surveys = db.query(Survey).all()
        initial_active_surveys = [s for s in all_surveys if s.status and s.status.lower() == "active"]

        # Case 1: Active Surveys Count Check
        mongo_mock = {"uploaded_media": MagicMock()}
        mongo_mock["uploaded_media"].aggregate.return_value = []

        stats = get_user_dashboard_stats(db=db, current_user=test_user, mongo_db=mongo_mock)
        assert stats["active_surveys"] == len(initial_active_surveys)

        # Create temporary test surveys to test dynamic counting across Cases
        s1 = Survey(title="KPI Test Survey 1", status="Active", start_date="2026-07-23", created_by=test_user.id)
        s2 = Survey(title="KPI Test Survey 2", status="Active", start_date="2026-07-23", created_by=test_user.id)
        s3 = Survey(title="KPI Test Survey 3", status="Paused", start_date="2026-07-23", created_by=test_user.id)
        db.add_all([s1, s2, s3])
        db.commit()

        # Active status check
        active_count = db.query(Survey).filter(Survey.status == "Active").count()
        stats = get_user_dashboard_stats(db=db, current_user=test_user, mongo_db=mongo_mock)
        assert stats["active_surveys"] == active_count

        # Pause one survey -> count must decrease by 1
        s1.status = "Paused"
        db.commit()
        stats_paused = get_user_dashboard_stats(db=db, current_user=test_user, mongo_db=mongo_mock)
        assert stats_paused["active_surveys"] == active_count - 1

        # Clean up temporary test surveys
        db.delete(s1)
        db.delete(s2)
        db.delete(s3)
        db.commit()

    finally:
        db.close()
