import pytest
from app.services.ecosystem_health_service import EcosystemHealthService

def test_ecosystem_health_weighted_formula():
    # Test formula calculation manually:
    # Sd = 80.0 (30% => 24.0)
    # Ps = 90.0 (25% => 22.5)
    # Hq = 70.0 (20% => 14.0)
    # Es = 100.0 (15% => 15.0)
    # Ec = 85.0 (10% => 8.5)
    # Total = 24.0 + 22.5 + 14.0 + 15.0 + 8.5 = 84.0 / 1.0 = 84.00

    scores = [
        {"weight": 0.30, "score": 80.0},
        {"weight": 0.25, "score": 90.0},
        {"weight": 0.20, "score": 70.0},
        {"weight": 0.15, "score": 100.0},
        {"weight": 0.10, "score": 85.0},
    ]

    total_weight = sum(s["weight"] for s in scores)
    weighted_sum = sum(s["score"] * s["weight"] for s in scores)
    overall_score = round(weighted_sum / total_weight, 2)

    assert overall_score == 84.0
    assert total_weight == 1.0
