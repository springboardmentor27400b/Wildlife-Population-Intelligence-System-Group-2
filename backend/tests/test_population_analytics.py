import pytest
from datetime import datetime
from app.services.population_analytics import PopulationAnalytics

def test_time_block_deduplication():
    # Detections occurring within the same 10-minute window for same site & species
    preds = [
        {
            "primary_species": "Tiger",
            "common_name": "Tiger",
            "monitoring_site_id": 1,
            "prediction_timestamp": "2026-07-29T10:02:15.000Z",
            "confidence": 0.85
        },
        {
            "primary_species": "Tiger",
            "common_name": "Tiger",
            "monitoring_site_id": 1,
            "prediction_timestamp": "2026-07-29T10:07:30.000Z",
            "confidence": 0.95
        },
        # Different time block (15 minutes later)
        {
            "primary_species": "Tiger",
            "common_name": "Tiger",
            "monitoring_site_id": 1,
            "prediction_timestamp": "2026-07-29T10:22:00.000Z",
            "confidence": 0.90
        },
        # Different species in same block
        {
            "primary_species": "Leopard",
            "common_name": "Leopard",
            "monitoring_site_id": 1,
            "prediction_timestamp": "2026-07-29T10:05:00.000Z",
            "confidence": 0.88
        }
    ]

    deduped = PopulationAnalytics.deduplicate_detections(preds, window_minutes=10)
    assert len(deduped) == 3  # 1 Tiger for 10:00-10:10 block, 1 Tiger for 10:20-10:30 block, 1 Leopard

def test_population_count_calculation():
    preds = [
        {"common_name": "Tiger", "monitoring_site_id": 1, "prediction_timestamp": "2026-07-29T10:01:00Z"},
        {"common_name": "Tiger", "monitoring_site_id": 1, "prediction_timestamp": "2026-07-29T10:05:00Z"},
        {"common_name": "Elephant", "monitoring_site_id": 2, "prediction_timestamp": "2026-07-29T11:00:00Z"}
    ]
    result = PopulationAnalytics.calculate_population_count(preds)
    assert result["total_raw_detections"] == 3
    assert result["total_deduplicated_population"] == 2
    assert result["deduplication_window_minutes"] == 10

def test_density_estimation():
    preds = [
        {"common_name": "Tiger", "confidence": 0.9, "prediction_timestamp": "2026-07-29T10:00:00Z"},
        {"common_name": "Tiger", "confidence": 0.8, "prediction_timestamp": "2026-07-29T10:30:00Z"}
    ]
    # D = (2 * 0.85) / 2.0 = 0.85
    result = PopulationAnalytics.estimate_density(preds, area_sq_km=2.0)
    assert result["deduplicated_individuals_N"] == 2
    assert result["average_confidence"] == 0.85
    assert result["density_per_sq_km"] == 0.85

def test_trends_calculation():
    preds = [
        {"common_name": "Tiger", "prediction_timestamp": "2026-07-28T10:00:00Z"},
        {"common_name": "Tiger", "prediction_timestamp": "2026-07-29T10:00:00Z"}
    ]
    result = PopulationAnalytics.calculate_trends(preds, time_interval="daily")
    assert result["total_periods"] == 2
    assert len(result["trends"]) == 2

def test_shannon_index_calculation():
    # 5 Tigers, 5 Elephants => p_i = 0.5 each => H' = -(0.5*ln(0.5) + 0.5*ln(0.5)) = ln(2) = 0.693
    counts = {"Tiger": 5, "Elephant": 5}
    h_prime = PopulationAnalytics.calculate_shannon_index(counts)
    assert h_prime == 0.693

def test_calculate_biodiversity_metrics():
    preds = [
        {"common_name": "Tiger", "prediction_timestamp": "2026-07-29T10:00:00Z"},
        {"common_name": "Elephant", "prediction_timestamp": "2026-07-29T10:00:00Z"}
    ]
    res = PopulationAnalytics.calculate_biodiversity_metrics(preds)
    assert res["shannon_index"] == 0.693
    assert res["species_richness"] == 2
    assert res["species_evenness"] == 1.0
    assert len(res["relative_abundance"]) == 2
