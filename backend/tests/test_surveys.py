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

def test_survey_crud_permissions(client: TestClient):
    admin_headers = get_auth_headers(client, "admin_survey@example.com", "Administrator")
    researcher_headers = get_auth_headers(client, "researcher_survey@example.com", "Wildlife Researcher")
    forest_headers = get_auth_headers(client, "forest_survey@example.com", "Forest Department Officer")
    
    # 1. Forest Officer tries to create survey - should be FORBIDDEN (403)
    survey_payload = {
        "name": "Tiger Census 2026",
        "description": "Counting tigers in forest range",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "status": "Planned"
    }
    response = client.post("/api/v1/surveys", json=survey_payload, headers=forest_headers)
    assert response.status_code == 403
    
    # 2. Researcher creates survey - should succeed (201)
    response = client.post("/api/v1/surveys", json=survey_payload, headers=researcher_headers)
    assert response.status_code == 201
    survey_id = response.json()["id"]
    
    # 3. List surveys (available to all active roles)
    response = client.get("/api/v1/surveys", headers=forest_headers)
    assert response.status_code == 200
    assert response.json()["total"] >= 1
    
    # 4. Update survey by Researcher (allowed)
    update_payload = {"name": "Updated Tiger Census 2026"}
    response = client.put(f"/api/v1/surveys/{survey_id}", json=update_payload, headers=researcher_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Tiger Census 2026"
    
    # 5. Delete survey by Researcher - should be FORBIDDEN (403)
    response = client.delete(f"/api/v1/surveys/{survey_id}", headers=researcher_headers)
    assert response.status_code == 403
    
    # 6. Delete survey by Admin - should succeed (204)
    response = client.delete(f"/api/v1/surveys/{survey_id}", headers=admin_headers)
    assert response.status_code == 204
