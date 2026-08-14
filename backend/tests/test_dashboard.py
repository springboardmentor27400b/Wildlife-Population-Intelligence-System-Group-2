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

def test_dashboard_summary_endpoint(client: TestClient):
    headers = get_auth_headers(client, "admin_dash@example.com", "Administrator")
    
    response = client.get("/api/v1/dashboard/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_surveys" in data
    assert "total_sites" in data
    assert "total_devices" in data
    assert "total_observations" in data
    assert "species_breakdown" in data
    assert "habitat_distribution" in data
    assert "sighting_timeline" in data
    assert "device_statuses" in data
