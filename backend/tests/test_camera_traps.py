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

def test_camera_trap_crud(client: TestClient):
    headers = get_auth_headers(client, "researcher_device@example.com", "Wildlife Researcher")
    
    # 1. Create camera trap
    trap_payload = {
        "model": "Bushnell Trophy Cam",
        "serial_number": "TRAP-SER-12345",
        "status": "Active"
    }
    response = client.post("/api/v1/camera-traps", json=trap_payload, headers=headers)
    assert response.status_code == 201
    trap_id = response.json()["id"]
    
    # 2. Prevent duplicate serial number
    response = client.post("/api/v1/camera-traps", json=trap_payload, headers=headers)
    assert response.status_code == 409
    
    # 3. Read camera details
    response = client.get(f"/api/v1/camera-traps/{trap_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["serial_number"] == "TRAP-SER-12345"
    
    # 4. List camera traps
    response = client.get("/api/v1/camera-traps", headers=headers)
    assert response.status_code == 200
    assert response.json()["total"] >= 1
    
    # 5. Delete camera trap by Researcher - should be FORBIDDEN (403)
    response = client.delete(f"/api/v1/camera-traps/{trap_id}", headers=headers)
    assert response.status_code == 403

    # 6. Delete camera trap by Admin - should succeed (204)
    admin_headers = get_auth_headers(client, "admin_trap@example.com", "Administrator")
    response = client.delete(f"/api/v1/camera-traps/{trap_id}", headers=admin_headers)
    assert response.status_code == 204
