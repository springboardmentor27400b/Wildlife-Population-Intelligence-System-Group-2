from fastapi.testclient import TestClient

def test_user_registration(client: TestClient):
    payload = {
        "email": "test_researcher@example.com",
        "password": "testpassword123",
        "full_name": "Dr. Sighting Tracker",
        "role": "Wildlife Researcher"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test_researcher@example.com"
    assert data["user"]["role"] == "Wildlife Researcher"

def test_user_login(client: TestClient):
    # First register user
    reg_payload = {
        "email": "login_user@example.com",
        "password": "loginpassword123",
        "full_name": "Login Tester",
        "role": "Administrator"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    
    # Login
    login_payload = {
        "username": "login_user@example.com",
        "password": "loginpassword123"
    }
    response = client.post("/api/v1/auth/login", data=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Administrator"

def test_login_invalid_credentials(client: TestClient):
    login_payload = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", data=login_payload)
    assert response.status_code == 401
