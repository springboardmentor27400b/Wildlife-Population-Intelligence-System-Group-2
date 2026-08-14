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

def test_audio_sensor_crud(client: TestClient):
    headers = get_auth_headers(client, "researcher_sensor@example.com", "Wildlife Researcher")
    
    # 1. Create audio sensor
    sensor_payload = {
        "model": "AudioMoth 1.2.0",
        "serial_number": "MOTH-SER-999",
        "status": "Active"
    }
    response = client.post("/api/v1/audio-sensors", json=sensor_payload, headers=headers)
    assert response.status_code == 201
    sensor_id = response.json()["id"]
    
    # 2. Duplicate check
    response = client.post("/api/v1/audio-sensors", json=sensor_payload, headers=headers)
    assert response.status_code == 409
    
    # 3. List
    response = client.get("/api/v1/audio-sensors", headers=headers)
    assert response.status_code == 200
    assert response.json()["total"] >= 1
    
    # 4. Delete audio sensor by Researcher - should be FORBIDDEN (403)
    response = client.delete(f"/api/v1/audio-sensors/{sensor_id}", headers=headers)
    assert response.status_code == 403

    # 5. Delete audio sensor by Admin - should succeed (204)
    admin_headers = get_auth_headers(client, "admin_sensor@example.com", "Administrator")
    response = client.delete(f"/api/v1/audio-sensors/{sensor_id}", headers=admin_headers)
    assert response.status_code == 204
