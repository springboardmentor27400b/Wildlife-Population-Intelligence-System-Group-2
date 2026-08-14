from fastapi.testclient import TestClient

def get_auth_headers(client: TestClient, email: str, role: str) -> dict:
    reg_payload = {
        "email": email,
        "password": "password123",
        "full_name": f"{role} Tester",
        "role": role
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_media_metadata_association(client: TestClient):
    headers = get_auth_headers(client, "admin_media@example.com", "Administrator")
    
    # Create survey and site and observation first
    survey_resp = client.post("/api/v1/surveys", json={
        "name": "Media Survey", "start_date": "2026-01-01", "end_date": "2026-12-31", "status": "Active"
    }, headers=headers)
    survey_id = survey_resp.json()["id"]
    
    site_resp = client.post("/api/v1/monitoring-sites", json={
        "name": "Forest Corner", "latitude": 10.0, "longitude": 20.0, "habitat_type": "Forest", "survey_id": survey_id
    }, headers=headers)
    site_id = site_resp.json()["id"]
    
    obs_resp = client.post("/api/v1/observations", json={
        "species": "Tiger", "count": 1, "observed_at": "2026-07-10T12:00:00Z",
        "latitude": 10.1, "longitude": 20.1, "site_id": site_id
    }, headers=headers)
    obs_id = obs_resp.json()["id"]
    
    # Log media
    media_payload = {
        "observation_id": obs_id,
        "file_name": "tiger_photo.jpg",
        "file_url": "http://cloudinary.com/tiger_photo.jpg",
        "public_id": "cloudinary_tiger_id",
        "mime_type": "image/jpeg",
        "file_size": 254000,
        "file_type": "image"
    }
    response = client.post("/api/v1/media", json=media_payload, headers=headers)
    assert response.status_code == 201
    media_id = response.json()["id"]
    
    # List media by observation
    response = client.get(f"/api/v1/media/observation/{obs_id}", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["file_name"] == "tiger_photo.jpg"
    
    # Observation response should now contain the media list nested!
    response = client.get(f"/api/v1/observations/{obs_id}", headers=headers)
    assert response.status_code == 200
    assert len(response.json()["media"]) == 1
    assert response.json()["media"][0]["file_name"] == "tiger_photo.jpg"
    
    # Delete media
    response = client.delete(f"/api/v1/media/{media_id}", headers=headers)
    assert response.status_code == 204
