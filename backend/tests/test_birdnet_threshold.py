import pytest
import sys
import os
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai.audio_inference_service import run_audio_inference

def test_birdnet_case_1_high_confidence_91():
    """Case 1: Confidence 91% -> Species displayed normally"""
    fake_birdnet_res = {
        "detected_species": "House Sparrow",
        "scientific_name": "Passer domesticus",
        "common_name": "House Sparrow",
        "confidence": 0.91,
        "top5_predictions": [{"species": "House Sparrow", "scientific_name": "Passer domesticus", "common_name": "House Sparrow", "confidence": 0.91}],
        "detected_events": [{"species": "House Sparrow", "scientific_name": "Passer domesticus", "common_name": "House Sparrow", "confidence": 0.91}],
        "audio_quality": {"overall_score": 85},
        "taxonomy": {"genus": "Passer", "species": "domesticus"}
    }
    with patch("app.services.ai.audio_inference_service.run_birdnet_inference", return_value=fake_birdnet_res):
        res = run_audio_inference("dummy_path.wav", analysis_type="bird")
        assert res["detected_species"] == "House Sparrow"
        assert res["common_name"] == "House Sparrow"
        assert res["scientific_name"] == "Passer domesticus"
        assert res["confidence"] == 0.91
        assert res["is_low_confidence"] is False
        assert res["confidence_threshold"] == 75

def test_birdnet_case_2_exact_threshold_75():
    """Case 2: Confidence 75% -> Species displayed normally"""
    fake_birdnet_res = {
        "detected_species": "Blue Jay",
        "scientific_name": "Cyanocitta cristata",
        "common_name": "Blue Jay",
        "confidence": 0.75,
        "top5_predictions": [{"species": "Blue Jay", "scientific_name": "Cyanocitta cristata", "common_name": "Blue Jay", "confidence": 0.75}],
        "detected_events": [{"species": "Blue Jay", "scientific_name": "Cyanocitta cristata", "common_name": "Blue Jay", "confidence": 0.75}],
        "audio_quality": {"overall_score": 80},
        "taxonomy": {"genus": "Cyanocitta", "species": "cristata"}
    }
    with patch("app.services.ai.audio_inference_service.run_birdnet_inference", return_value=fake_birdnet_res):
        res = run_audio_inference("dummy_path.wav", analysis_type="bird")
        assert res["detected_species"] == "Blue Jay"
        assert res["common_name"] == "Blue Jay"
        assert res["scientific_name"] == "Cyanocitta cristata"
        assert res["confidence"] == 0.75
        assert res["is_low_confidence"] is False
        assert res["confidence_threshold"] == 75

def test_birdnet_case_3_just_below_threshold_74_99():
    """Case 3: Confidence 74.99% -> Unknown Species Detected"""
    fake_birdnet_res = {
        "detected_species": "Northern Cardinal",
        "scientific_name": "Cardinalis cardinalis",
        "common_name": "Northern Cardinal",
        "confidence": 0.7499,
        "top5_predictions": [{"species": "Northern Cardinal", "scientific_name": "Cardinalis cardinalis", "common_name": "Northern Cardinal", "confidence": 0.7499}],
        "detected_events": [{"species": "Northern Cardinal", "scientific_name": "Cardinalis cardinalis", "common_name": "Northern Cardinal", "confidence": 0.7499}],
        "audio_quality": {"overall_score": 75},
        "taxonomy": {"genus": "Cardinalis", "species": "cardinalis"}
    }
    with patch("app.services.ai.audio_inference_service.run_birdnet_inference", return_value=fake_birdnet_res):
        res = run_audio_inference("dummy_path.wav", analysis_type="bird")
        assert res["detected_species"] == "Unknown Species Detected"
        assert res["common_name"] == "Unknown Species Detected"
        assert res["scientific_name"] == "N/A"
        assert res["confidence"] == 0.7499
        assert res["is_low_confidence"] is True
        assert res["confidence_threshold"] == 75
        assert res["status"] == "Low Confidence Prediction"
        assert res["reason"] == "BirdNET confidence below identification threshold."
        assert res["top5_predictions"][0]["species"] == "Unknown Species Detected"
        assert res["detected_events"][0]["species"] == "Unknown Species Detected"

def test_birdnet_case_4_lion_audio_10():
    """Case 4: Lion audio (BirdNET outputs Gray Wolf 10.96%) -> Unknown Species Detected"""
    fake_birdnet_res = {
        "detected_species": "Gray Wolf",
        "scientific_name": "Canis lupus",
        "common_name": "Gray Wolf",
        "confidence": 0.1096,
        "top5_predictions": [{"species": "Gray Wolf", "scientific_name": "Canis lupus", "common_name": "Gray Wolf", "confidence": 0.1096}],
        "detected_events": [{"species": "Gray Wolf", "scientific_name": "Canis lupus", "common_name": "Gray Wolf", "confidence": 0.1096}],
        "audio_quality": {"overall_score": 60},
        "taxonomy": {"genus": "Canis", "species": "lupus"}
    }
    with patch("app.services.ai.audio_inference_service.run_birdnet_inference", return_value=fake_birdnet_res):
        res = run_audio_inference("dummy_path.wav", analysis_type="bird")
        assert res["detected_species"] == "Unknown Species Detected"
        assert res["common_name"] == "Unknown Species Detected"
        assert res["scientific_name"] == "N/A"
        assert res["confidence"] == 0.1096
        assert res["is_low_confidence"] is True
        assert res["confidence_threshold"] == 75
        assert res["status"] == "Low Confidence Prediction"
        assert res["top5_predictions"][0]["species"] == "Unknown Species Detected"
        assert res["detected_events"][0]["species"] == "Unknown Species Detected"

def test_birdnet_case_5_random_noise():
    """Case 5: Random environmental noise (low confidence e.g. 5%) -> Unknown Species Detected"""
    fake_birdnet_res = {
        "detected_species": "American Robin",
        "scientific_name": "Turdus migratorius",
        "common_name": "American Robin",
        "confidence": 0.05,
        "top5_predictions": [{"species": "American Robin", "scientific_name": "Turdus migratorius", "common_name": "American Robin", "confidence": 0.05}],
        "detected_events": [{"species": "American Robin", "scientific_name": "Turdus migratorius", "common_name": "American Robin", "confidence": 0.05}],
        "audio_quality": {"overall_score": 40},
        "taxonomy": {"genus": "Turdus", "species": "migratorius"}
    }
    with patch("app.services.ai.audio_inference_service.run_birdnet_inference", return_value=fake_birdnet_res):
        res = run_audio_inference("dummy_path.wav", analysis_type="bird")
        assert res["detected_species"] == "Unknown Species Detected"
        assert res["common_name"] == "Unknown Species Detected"
        assert res["scientific_name"] == "N/A"
        assert res["confidence"] == 0.05
        assert res["is_low_confidence"] is True
        assert res["confidence_threshold"] == 75
        assert res["top5_predictions"][0]["species"] == "Unknown Species Detected"
        assert res["detected_events"][0]["species"] == "Unknown Species Detected"
