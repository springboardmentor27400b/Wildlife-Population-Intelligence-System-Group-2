import io
import os
import sys
import uuid
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = f"sqlite:///./test_milestone2_{uuid.uuid4().hex}.db"

from app.main import app
from app.services.model_manager import model_manager

client = TestClient(app)


def create_dummy_wav_bytes() -> bytes:
    """Creates a minimal valid 1-second silent WAV at 44100 Hz for testing."""
    import struct
    sample_rate = 44100
    num_channels = 1
    bits_per_sample = 16
    num_samples = sample_rate  # 1 second
    data_size = num_samples * num_channels * (bits_per_sample // 8)
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)

    # RIFF header
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + data_size,   # file size - 8
        b"WAVE",
        b"fmt ",
        16,               # chunk size
        1,                # PCM format
        num_channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b"data",
        data_size,
    )
    # Silent audio: all zeros
    audio_data = b"\x00" * data_size
    return header + audio_data


def test_bioacoustic_feature_extraction():
    temp_dir = Path("./uploads/audio")
    temp_dir.mkdir(parents=True, exist_ok=True)
    temp_file = temp_dir / f"test_audio_{uuid.uuid4().hex}.wav"
    temp_file.write_bytes(create_dummy_wav_bytes())

    result = model_manager.predict_audio(str(temp_file))

    assert "species" in result
    assert "confidence" in result
    assert "duration" in result
    assert "frequency" in result
    assert "features" in result
    assert "prediction_time" in result

    if temp_file.exists():
        temp_file.unlink()


def test_audio_upload_endpoint_and_rbac():
    # Register researcher user
    payload = {
        "full_name": "Audio Researcher",
        "email": f"audio-{uuid.uuid4().hex[:8]}@example.com",
        "password": "audiopassword123",
        "role": "wildlife_researcher",
    }
    reg_res = client.post("/api/register", json=payload)
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]

    wav_bytes = create_dummy_wav_bytes()
    files = {"file": ("bird_call.wav", wav_bytes, "audio/wav")}
    response = client.post(
        "/api/ai/audio/upload",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "species" in data
    assert "confidence" in data
    assert "duration" in data
    assert "frequency" in data


def test_unsupported_audio_format_rejection():
    payload = {
        "full_name": "Audio Tester 2",
        "email": f"audio2-{uuid.uuid4().hex[:8]}@example.com",
        "password": "audiopassword123",
        "role": "wildlife_researcher",
    }
    reg_res = client.post("/api/register", json=payload)
    token = reg_res.json()["access_token"]

    files = {"file": ("script.sh", b"echo test", "text/plain")}
    response = client.post(
        "/api/ai/audio/upload",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "Unsupported audio format" in response.json()["detail"]


def test_biodiversity_dashboard_analytics():
    payload = {
        "full_name": "Bio Dashboard User",
        "email": f"bio-{uuid.uuid4().hex[:8]}@example.com",
        "password": "biopassword123",
        "role": "wildlife_researcher",
    }
    reg_res = client.post("/api/register", json=payload)
    token = reg_res.json()["access_token"]

    response = client.get("/api/ai/biodiversity", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "total_species" in data
    assert "diversity_index" in data
    assert "image_count" in data
    assert "audio_count" in data


def test_pdf_report_generation_endpoint():
    payload = {
        "full_name": "Report User",
        "email": f"report-{uuid.uuid4().hex[:8]}@example.com",
        "password": "reportpassword123",
        "role": "wildlife_researcher",
    }
    reg_res = client.post("/api/register", json=payload)
    token = reg_res.json()["access_token"]

    response = client.get("/api/ai/report/pdf", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 500
