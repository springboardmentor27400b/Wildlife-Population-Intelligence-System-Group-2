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

def test_observation_crud(client: TestClient):
    headers = get_auth_headers(client, "officer_obs@example.com", "Conservation Officer")
    
    # 1. Create survey and site first
    survey_payload = {
        "name": "Tiger Survey",
        "description": "Counting tigers",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "status": "Active"
    }
    # Wait, Conservation Officer cannot create survey!
    # Let's create survey with Admin instead
    admin_headers = get_auth_headers(client, "admin_obs@example.com", "Administrator")
    survey_resp = client.post("/api/v1/surveys", json=survey_payload, headers=admin_headers)
    survey_id = survey_resp.json()["id"]
    
    site_payload = {
        "name": "Waterhole 2",
        "description": "Main waterhole camera",
        "latitude": 23.45,
        "longitude": 80.12,
        "habitat_type": "Wetland",
        "survey_id": survey_id
    }
    site_resp = client.post("/api/v1/monitoring-sites", json=site_payload, headers=admin_headers)
    site_id = site_resp.json()["id"]
    
    # 2. Log observation with Conservation Officer should be FORBIDDEN (403)
    obs_payload = {
        "species": "Panthera tigris (Bengal Tiger)",
        "count": 2,
        "observed_at": "2026-07-10T12:00:00Z",
        "latitude": 23.456,
        "longitude": 80.123,
        "notes": "Spotted drinking at noon",
        "site_id": site_id
    }
    response = client.post("/api/v1/observations", json=obs_payload, headers=headers)
    assert response.status_code == 403

    # Log observation with Wildlife Researcher should succeed (201)
    researcher_headers = get_auth_headers(client, "researcher_obs@example.com", "Wildlife Researcher")
    response = client.post("/api/v1/observations", json=obs_payload, headers=researcher_headers)
    assert response.status_code == 201
    obs_id = response.json()["id"]
    
    # 3. Read observation details (Conservation Officer can view)
    response = client.get(f"/api/v1/observations/{obs_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["species"] == "Panthera tigris (Bengal Tiger)"
    assert response.json()["count"] == 2

    # Conservation Officer can review and edit observations
    edit_payload = {"count": 3}
    response = client.put(f"/api/v1/observations/{obs_id}", json=edit_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["count"] == 3
    
    # 4. List observations
    response = client.get(f"/api/v1/observations?site_id={site_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1
    
    # 5. Delete observation (requires Admin/Researcher permission, forbidden for Officer)
    response = client.delete(f"/api/v1/observations/{obs_id}", headers=headers)
    assert response.status_code == 403
    
    response = client.delete(f"/api/v1/observations/{obs_id}", headers=admin_headers)
    assert response.status_code == 204
