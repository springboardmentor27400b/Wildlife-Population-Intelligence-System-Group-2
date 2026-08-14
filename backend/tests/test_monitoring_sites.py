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

def test_monitoring_site_crud(client: TestClient):
    headers = get_auth_headers(client, "researcher_site@example.com", "Wildlife Researcher")
    
    # Create survey first
    survey_payload = {
        "name": "Site Survey",
        "description": "Counting wildlife",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "status": "Planned"
    }
    survey_resp = client.post("/api/v1/surveys", json=survey_payload, headers=headers)
    survey_id = survey_resp.json()["id"]
    
    # Create monitoring site
    site_payload = {
        "name": "North Sector Ridge",
        "description": "Hilltop camera area",
        "latitude": 34.55,
        "longitude": 76.88,
        "habitat_type": "Mountain",
        "survey_id": survey_id
    }
    response = client.post("/api/v1/monitoring-sites", json=site_payload, headers=headers)
    assert response.status_code == 201
    site_id = response.json()["id"]
    
    # List sites
    response = client.get(f"/api/v1/monitoring-sites?survey_id={survey_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1
    
    # Update site coordinates
    update_payload = {"latitude": 34.56, "longitude": 76.89}
    response = client.put(f"/api/v1/monitoring-sites/{site_id}", json=update_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["latitude"] == 34.56
    
    # Bad coordinates check
    bad_payload = {"latitude": 95.0}
    response = client.put(f"/api/v1/monitoring-sites/{site_id}", json=bad_payload, headers=headers)
    assert response.status_code == 400
