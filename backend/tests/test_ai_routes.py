import os
import sys
import uuid
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("DATABASE_URL", f"sqlite:///./test_wildlife_{uuid.uuid4().hex}.db")

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_models_status_endpoint():
    response = client.get("/api/models/status")
    assert response.status_code == 200
    assert "image_model_loaded" in response.json()


def test_auth_registration_and_login():
    payload = {
        "full_name": "Test User",
        "email": f"test-user-{uuid.uuid4().hex[:8]}@example.com",
        "password": "testpass123",
        "role": "wildlife_researcher",
    }
    response = client.post("/api/register", json=payload)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token

    profile_response = client.get("/api/profile", headers={"Authorization": f"Bearer {token}"})
    assert profile_response.status_code == 200
    assert profile_response.json()["email"] == payload["email"]
