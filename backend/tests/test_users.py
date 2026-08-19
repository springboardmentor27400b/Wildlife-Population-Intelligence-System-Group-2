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

def test_list_users_unauthorized(client: TestClient):
    # Non-admin user
    reg_payload = {
        "email": "non_admin_test@example.com",
        "password": "nonadminpassword123",
        "full_name": "Non Admin",
        "role": "Wildlife Researcher"
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/users", headers=headers)
    assert response.status_code == 403

def test_admin_user_management_flow(client: TestClient):
    # Register an admin
    admin_payload = {
        "email": "admin_test_mgr@example.com",
        "password": "adminpassword123",
        "full_name": "Admin Tester",
        "role": "Administrator"
    }
    admin_resp = client.post("/api/v1/auth/register", json=admin_payload)
    admin_token = admin_resp.json()["access_token"]
    
    # Register a normal user to manage
    user_payload = {
        "email": "user_test_mgr@example.com",
        "password": "userpassword123",
        "full_name": "User Tester",
        "role": "Forest Department Officer"
    }
    user_resp = client.post("/api/v1/auth/register", json=user_payload)
    target_user_id = user_resp.json()["user"]["id"]
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Admin list all users
    list_resp = client.get("/api/v1/users", headers=headers)
    assert list_resp.status_code == 200
    users_list = list_resp.json()
    emails = [u["email"] for u in users_list]
    assert "user_test_mgr@example.com" in emails
    
    # 2. Admin update user role
    update_resp = client.put(
        f"/api/v1/users/{target_user_id}",
        json={"role": "Wildlife Researcher"},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["role"] == "Wildlife Researcher"
    
    # 3. Admin delete user
    delete_resp = client.delete(f"/api/v1/users/{target_user_id}", headers=headers)
    assert delete_resp.status_code == 204
