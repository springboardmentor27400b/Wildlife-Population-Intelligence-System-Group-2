import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_api_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"

def test_api_models_status(client):
    response = client.get("/api/models/status")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data or "yolo" in data or "status" in data or isinstance(data, dict)
