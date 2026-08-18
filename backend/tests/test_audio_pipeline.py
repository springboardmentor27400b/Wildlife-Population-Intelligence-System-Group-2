import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai import audio_inference_service

def test_animalclap_exclusive_for_wildlife_audio():
    mock_animalclap_res = {
        "detected_species": "Panthera leo",
        "scientific_name": "Panthera leo",
        "common_name": "African Lion",
        "confidence": 0.2522,
        "top5_predictions": [{"species": "African Lion", "confidence": 0.2522}],
        "detected_events": [],
        "audio_quality": {"duration": 6.0, "overall_score": 80},
        "taxonomy": {"genus": "Panthera", "species": "Panthera leo"}
    }

    dummy_path = r"e:\INFOSYS INTERNSHIP\backend\app\media\65b13983-9b19-46f5-b504-6a49a5a03162.mp3"

    with patch("app.services.ai.audio_inference_service.run_animalclap_inference", return_value=mock_animalclap_res) as mock_animalclap:
        res = audio_inference_service.run_audio_inference(dummy_path, analysis_type="wildlife")
        
        mock_animalclap.assert_called_once()
        assert res["source_model"] == "AnimalCLAP"
        assert res["fallback_used"] is False
        assert res["confidence"] == 0.2522
        assert res["detected_species"] == "Panthera leo"

def test_birdnet_exclusive_for_bird_audio():
    mock_birdnet_res = {
        "detected_species": "American Robin",
        "scientific_name": "Turdus migratorius",
        "common_name": "American Robin",
        "confidence": 0.88,
        "top5_predictions": [{"species": "American Robin", "confidence": 0.88}],
        "detected_events": [],
        "audio_quality": {"duration": 5.0, "overall_score": 95},
        "taxonomy": {"genus": "Turdus", "species": "Turdus migratorius"}
    }

    dummy_path = r"e:\INFOSYS INTERNSHIP\backend\app\media\65b13983-9b19-46f5-b504-6a49a5a03162.mp3"

    with patch("app.services.ai.audio_inference_service.run_birdnet_inference", return_value=mock_birdnet_res) as mock_birdnet:
        res = audio_inference_service.run_audio_inference(dummy_path, analysis_type="bird")
        
        mock_birdnet.assert_called_once()
        assert res["source_model"] == "BirdNET"
        assert res["fallback_used"] is False
        assert res["detected_species"] == "American Robin"
