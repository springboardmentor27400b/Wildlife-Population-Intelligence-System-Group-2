from fastapi.testclient import TestClient

def test_get_profile(client: TestClient):
    # Register and get token
    reg_payload = {
        "email": "profile_user@example.com",
        "password": "profilepassword123",
        "full_name": "Profile Tester",
        "role": "Conservation Officer"
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile_user@example.com"
    assert data["role"] == "Conservation Officer"

def test_update_profile(client: TestClient):
    reg_payload = {
        "email": "update_user@example.com",
        "password": "updatepassword123",
        "full_name": "Before Update",
        "role": "Conservation Officer"
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    update_payload = {
        "full_name": "After Update",
        "email": "new_email@example.com"
    }
    response = client.put("/api/v1/users/me", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "After Update"
    assert data["email"] == "new_email@example.com"
