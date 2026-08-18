import pytest
from datetime import date
from io import BytesIO
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.config import settings
from app.core.database import get_db
from app.models.sql import User, UserRole, MonitoringSite, Survey, Device, Observation

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
def admin_headers(client):
    # Register and login an admin user
    email = "admin_survey_test@park.org"
    password = "securepassword"
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Admin Tester",
        "role": "Admin"
    })
    res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def researcher_headers(client):
    # Register and login a researcher user
    email = "researcher_survey_test@park.org"
    password = "securepassword"
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Researcher Tester",
        "role": "Researcher"
    })
    res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_monitoring_site_crud(client, researcher_headers, admin_headers):
    # 1. Create site
    site_payload = {
        "name": "Serengeti Plot A",
        "latitude": -2.15,
        "longitude": 34.68,
        "habitat_type": "Savanna",
        "protected_area": "Serengeti National Park"
    }
    res_create = client.post("/api/sites/", json=site_payload, headers=researcher_headers)
    assert res_create.status_code == 201
    site_data = res_create.json()
    assert site_data["name"] == site_payload["name"]
    assert site_data["latitude"] == site_payload["latitude"]
    assert site_data["longitude"] == site_payload["longitude"]
    site_id = site_data["id"]

    # 2. Get site
    res_get = client.get(f"/api/sites/{site_id}", headers=researcher_headers)
    assert res_get.status_code == 200
    assert res_get.json()["name"] == site_payload["name"]

    # 3. List sites
    res_list = client.get("/api/sites/", headers=researcher_headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

    # 4. Update site
    update_payload = {"name": "Serengeti Plot A - Main"}
    res_update = client.put(f"/api/sites/{site_id}", json=update_payload, headers=researcher_headers)
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Serengeti Plot A - Main"
    assert res_update.json()["latitude"] == site_payload["latitude"] # coords remain same

    # 5. Delete site (only Admin role)
    # Researcher deletes (should fail with 403)
    res_del_fail = client.delete(f"/api/sites/{site_id}", headers=researcher_headers)
    assert res_del_fail.status_code == 403

    # Admin deletes (should succeed with 204)
    res_del_ok = client.delete(f"/api/sites/{site_id}", headers=admin_headers)
    assert res_del_ok.status_code == 204

def test_survey_crud(client, researcher_headers, admin_headers):
    # 1. Create survey
    survey_payload = {
        "title": "Large Mammal Census 2026",
        "start_date": str(date(2026, 1, 1)),
        "description": "Counting migrations of big mammals in savanna",
        "status": "Active"
    }
    res_create = client.post("/api/surveys/", json=survey_payload, headers=researcher_headers)
    assert res_create.status_code == 201
    survey_data = res_create.json()
    assert survey_data["title"] == survey_payload["title"]
    survey_id = survey_data["id"]

    # 2. Get survey
    res_get = client.get(f"/api/surveys/{survey_id}", headers=researcher_headers)
    assert res_get.status_code == 200
    assert res_get.json()["title"] == survey_payload["title"]

    # 3. Update survey
    update_payload = {"status": "Paused"}
    res_update = client.put(f"/api/surveys/{survey_id}", json=update_payload, headers=researcher_headers)
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "Paused"

    # 4. Delete survey
    res_del_ok = client.delete(f"/api/surveys/{survey_id}", headers=admin_headers)
    assert res_del_ok.status_code == 204

def test_device_crud(client, researcher_headers, admin_headers):
    # Create a site first
    site_payload = {
        "name": "Site B",
        "latitude": 5.4,
        "longitude": 10.2,
        "habitat_type": "Wetland"
    }
    site_res = client.post("/api/sites/", json=site_payload, headers=researcher_headers)
    site_id = site_res.json()["id"]

    # 1. Create device
    device_payload = {
        "site_id": site_id,
        "type": "CameraTrap",
        "model_number": "YoloCam-V4",
        "deployment_date": str(date(2026, 3, 15)),
        "status": "Operational"
    }
    res_create = client.post("/api/devices/", json=device_payload, headers=researcher_headers)
    assert res_create.status_code == 201
    device_data = res_create.json()
    assert device_data["model_number"] == device_payload["model_number"]
    device_id = device_data["id"]

    # 2. Update device status
    res_update = client.put(f"/api/devices/{device_id}", json={"status": "Maintenance"}, headers=researcher_headers)
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "Maintenance"

    # 3. Delete device
    res_del = client.delete(f"/api/devices/{device_id}", headers=admin_headers)
    assert res_del.status_code == 204

def test_observations_and_media_upload(client, researcher_headers):
    # Setup dependencies
    site_res = client.post("/api/sites/", json={"name": "Site C", "latitude": 0.0, "longitude": 0.0, "habitat_type": "Forest"}, headers=researcher_headers)
    site_id = site_res.json()["id"]

    survey_res = client.post("/api/surveys/", json={"title": "Bird Survey", "start_date": str(date(2026, 1, 1))}, headers=researcher_headers)
    survey_id = survey_res.json()["id"]

    device_res = client.post("/api/devices/", json={"site_id": site_id, "type": "AudioSensor", "deployment_date": str(date(2026, 1, 1))}, headers=researcher_headers)
    device_id = device_res.json()["id"]

    # 1. Test media upload
    dummy_image = BytesIO(b"dummy image data")
    dummy_image.name = "trap_photo.png"
    
    dummy_audio = BytesIO(b"dummy audio data")
    dummy_audio.name = "bird_call.wav"
    
    upload_res = client.post(
        "/api/observations/upload",
        files=[
            ("files", ("trap_photo.png", dummy_image, "image/png")),
            ("files", ("bird_call.wav", dummy_audio, "audio/wav")),
        ],
        headers=researcher_headers
    )
    assert upload_res.status_code == 201
    urls = upload_res.json()["urls"]
    assert len(urls) == 2
    assert urls[0].startswith("/media/")

    # 2. Test create observation
    obs_payload = {
        "survey_id": survey_id,
        "site_id": site_id,
        "device_id": device_id,
        "uploaded_images": [urls[0]],
        "uploaded_audio": [urls[1]],
        "observation_notes": "Heard a rare nightingale call and captured a shadow image."
    }
    obs_create = client.post("/api/observations/", json=obs_payload, headers=researcher_headers)
    assert obs_create.status_code == 201
    obs_data = obs_create.json()
    assert obs_data["observation_notes"] == obs_payload["observation_notes"]
    assert obs_data["uploaded_images"] == obs_payload["uploaded_images"]
    obs_id = obs_data["id"]

    # 3. Test list observations
    obs_list = client.get("/api/observations/", headers=researcher_headers)
    assert obs_list.status_code == 200
    assert len(obs_list.json()) >= 1

    # 4. Test survey history
    history_res = client.get(f"/api/observations/survey/{survey_id}/history", headers=researcher_headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) == 1
    assert history_res.json()[0]["id"] == obs_id
