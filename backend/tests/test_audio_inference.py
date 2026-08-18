import os
import wave
import struct
import math
import pytest
from io import BytesIO
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.config import settings
from app.core.database import get_db
from app.services.ai import audio_quality_service, audio_inference_service

# Set up test DB engine
engine = create_engine(settings.DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    app.dependency_overrides[get_db] = lambda: session
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="function")
def client(db_session):
    return TestClient(app)

@pytest.fixture(scope="function")
def researcher_headers(client):
    # Register and login a researcher user
    email = "researcher_audio_test@park.org"
    password = "securepassword"
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Audio Researcher",
        "role": "Researcher"
    })
    res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def sample_audio_path(tmp_path):
    # Generate a 5-second dummy WAV file
    filepath = str(tmp_path / "dummy.wav")
    sample_rate = 32000
    duration_s = 5.0
    num_samples = int(duration_s * sample_rate)
    with wave.open(filepath, "w") as wav_file:
        wav_file.setparams((1, 2, sample_rate, num_samples, "NONE", "not compressed"))
        for i in range(num_samples):
            # 440 Hz tone
            value = int(32767.0 * math.sin(2.0 * math.pi * 440.0 * i / sample_rate))
            wav_file.writeframes(struct.pack("<h", value))
    return filepath

@pytest.fixture(autouse=True)
def mock_birdnet_inference(monkeypatch):
    def mock_run(audio_path):
        return {
            "detected_species": "Rufous-faced Warbler",
            "scientific_name": "Abroscopus albogularis",
            "common_name": "Rufous-faced Warbler",
            "confidence": 0.85,
            "top5_predictions": [
                {"species": "Rufous-faced Warbler", "scientific_name": "Abroscopus albogularis", "common_name": "Rufous-faced Warbler", "confidence": 0.85},
                {"species": "Black-faced Warbler", "scientific_name": "Abroscopus schisticeps", "common_name": "Black-faced Warbler", "confidence": 0.70},
                {"species": "Eurasian Skylark", "scientific_name": "Alauda arvensis", "common_name": "Eurasian Skylark", "confidence": 0.10},
                {"species": "Northern Goshawk", "scientific_name": "Accipiter gentilis", "common_name": "Northern Goshawk", "confidence": 0.05},
                {"species": "Eurasian Sparrowhawk", "scientific_name": "Accipiter nisus", "common_name": "Eurasian Sparrowhawk", "confidence": 0.02}
            ],
            "detected_events": [
                {"start_time": 0.0, "end_time": 3.0, "species": "Rufous-faced Warbler", "scientific_name": "Abroscopus albogularis", "common_name": "Rufous-faced Warbler", "confidence": 0.85}
            ],
            "audio_quality": {
                "duration": 5.0,
                "sample_rate": 32000,
                "channels": 1,
                "signal_level": 0.1,
                "clipping_detected": False,
                "silence_percentage": 10.0,
                "estimated_noise_level": 0.01,
                "overall_score": 85,
                "overall_rating": "Excellent"
            },
            "taxonomy": {
                "genus": "Abroscopus",
                "species": "albogularis",
                "scientific_name": "Abroscopus albogularis",
                "common_name": "Rufous-faced Warbler"
            }
        }
    monkeypatch.setattr("app.services.ai.birdnet_engine.run_birdnet_inference", mock_run)

def test_audio_quality_analysis(sample_audio_path):
    """
    Verifies that quality analytics extract correct metrics and run without crash.
    """
    report = audio_quality_service.analyze_audio_quality(sample_audio_path)
    assert report["duration"] == 5.0
    assert report["sample_rate"] == 32000
    assert report["channels"] == 1
    assert "overall_score" in report
    assert "overall_rating" in report

def test_audio_inference_pipeline_success(sample_audio_path):
    """
    Verifies that audio inference pipeline works offline.
    """
    res = audio_inference_service.run_audio_inference_pipeline(sample_audio_path)
    assert res["detected_species"] is not None
    assert "audio_quality" in res
    assert "top5_predictions" in res
    assert "detected_events" in res

def test_endpoint_audio_analyze_flow(client, researcher_headers, sample_audio_path):
    """
    End-to-end integration test:
    1. Upload dummy audio
    2. Get media ID
    3. Run POST /api/ai/audio/analyze
    4. Confirm structured JSON output matches expectations
    """
    # Read the dummy sample audio file
    with open(sample_audio_path, "rb") as aud_file:
        aud_bytes = aud_file.read()

    # 1. Upload the dummy audio
    upload_res = client.post(
        "/api/observations/upload",
        files=[("files", ("test_audio.wav", BytesIO(aud_bytes), "audio/wav"))],
        headers=researcher_headers
    )
    assert upload_res.status_code == 201
    urls = upload_res.json()["urls"]
    assert len(urls) == 1
    storage_path = urls[0]

    # 2. Find the media_id via list_uploaded_media
    media_list_res = client.get("/api/observations/media", headers=researcher_headers)
    assert media_list_res.status_code == 200
    media_list = media_list_res.json()
    
    media_id = None
    for item in media_list:
        if item.get("storage_path") == storage_path:
            media_id = item.get("_id")
            break

    assert media_id is not None, f"Could not find uploaded media for path: {storage_path}"

    # 3. Analyze the audio
    analyze_res = client.post(
        "/api/ai/audio/analyze",
        json={"media_id": media_id},
        headers=researcher_headers
    )
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert data["detected_species"] is not None
    assert "top5_predictions" in data
    assert "detected_events" in data
    assert "audio_quality" in data
    assert "overall_score" in data["audio_quality"]
    assert "overall_rating" in data["audio_quality"]
    assert "prediction_id" in data

    # Verify that it is stored in MongoDB predictions collection
    from app.core.database import mongo_db
    from bson.objectid import ObjectId
    pred_doc = mongo_db["predictions"].find_one({"_id": ObjectId(data["prediction_id"])})
    assert pred_doc is not None, "Prediction document not persisted in MongoDB!"
    assert pred_doc["uploaded_media_id"] == media_id
    assert pred_doc["media_type"] == "audio"
    assert pred_doc["primary_species"] == data["detected_species"]
    assert pred_doc["confidence"] == data["confidence"]
    assert pred_doc["number_of_acoustic_events"] == len(data["detected_events"])
    assert "audio_quality" in pred_doc
    assert pred_doc["processing_status"] == "completed"
