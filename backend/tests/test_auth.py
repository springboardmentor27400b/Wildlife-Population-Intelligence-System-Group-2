import pytest
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.config import settings
from app.core.database import get_db, Base
from app.api.deps import get_current_user, RoleChecker
from app.models.sql import User, UserRole

# Set up test database engine (using the same local DB but isolation through transactions)
engine = create_engine(settings.DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Add a test role protection route to verify Role Guards
@app.get("/api/test-admin-only", dependencies=[Depends(RoleChecker(["Admin"]))])
def route_admin_only(current_user: User = Depends(get_current_user)):
    return {"message": "Hello Admin!"}

@app.get("/api/test-any-auth")
def route_any_auth(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email}


@pytest.fixture(scope="function")
def db_session():
    # Start a transaction
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Override get_db dependency
    app.dependency_overrides[get_db] = lambda: session
    
    yield session
    
    # Roll back after the test completes
    session.close()
    transaction.rollback()
    connection.close()
    
    # Remove override
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="function")
def client(db_session):
    return TestClient(app)

def test_user_registration(client):
    # Register a new researcher user
    payload = {
        "email": "test_researcher@park.org",
        "password": "securepassword123",
        "full_name": "Test Researcher",
        "role": "Researcher"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["full_name"] == payload["full_name"]
    assert data["role"] == "Researcher"
    assert data["is_active"] is True
    assert "id" in data
    assert "hashed_password" not in data  # Ensure security: no hashed password exposed!

    # Test duplicate registration
    response_dup = client.post("/api/auth/register", json=payload)
    assert response_dup.status_code == 400
    assert "already exists" in response_dup.json()["detail"]

def test_user_login(client):
    # Pre-register user in DB
    payload = {
        "email": "login_test@park.org",
        "password": "mypassword123",
        "full_name": "Login Tester",
        "role": "Admin"
    }
    client.post("/api/auth/register", json=payload)

    # Valid Login
    login_data = {
        "username": payload["email"],
        "password": payload["password"]
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # Invalid Login
    invalid_login = {
        "username": payload["email"],
        "password": "wrongpassword"
    }
    response_fail = client.post("/api/auth/login", data=invalid_login)
    assert response_fail.status_code == 401
    assert "Incorrect email or password" in response_fail.json()["detail"]

def test_user_profile_management(client):
    # Pre-register and login user
    email = "profile_test@park.org"
    password = "profilepassword"
    payload = {
        "email": email,
        "password": password,
        "full_name": "Profile Tester",
        "role": "Researcher"
    }
    client.post("/api/auth/register", json=payload)

    login_res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # GET /api/profile
    profile_res = client.get("/api/profile/", headers=headers)
    assert profile_res.status_code == 200
    profile_data = profile_res.json()
    assert profile_data["email"] == email
    assert profile_data["full_name"] == "Profile Tester"
    assert profile_data["role"] == "Researcher"

    # PUT /api/profile (update full name)
    update_payload = {"full_name": "Updated Profile Tester"}
    update_res = client.put("/api/profile/", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["full_name"] == "Updated Profile Tester"

    # PUT /api/profile (update password)
    pwd_update_payload = {"password": "newsecurepassword"}
    pwd_update_res = client.put("/api/profile/", json=pwd_update_payload, headers=headers)
    assert pwd_update_res.status_code == 200

    # Verify login with new password
    login_new = client.post("/api/auth/login", data={"username": email, "password": "newsecurepassword"})
    assert login_new.status_code == 200

def test_role_guards(client):
    # Register Researcher user
    res_payload = {
        "email": "guard_researcher@park.org",
        "password": "password123",
        "full_name": "Researcher Guard Tester",
        "role": "Researcher"
    }
    client.post("/api/auth/register", json=res_payload)
    res_login = client.post("/api/auth/login", data={"username": res_payload["email"], "password": res_payload["password"]})
    res_token = res_login.json()["access_token"]

    # Register Admin user
    admin_payload = {
        "email": "guard_admin@park.org",
        "password": "password123",
        "full_name": "Admin Guard Tester",
        "role": "Admin"
    }
    client.post("/api/auth/register", json=admin_payload)
    admin_login = client.post("/api/auth/login", data={"username": admin_payload["email"], "password": admin_payload["password"]})
    admin_token = admin_login.json()["access_token"]

    # Researcher accesses Admin-only route (should be 403 Forbidden)
    res_guard_response = client.get("/api/test-admin-only", headers={"Authorization": f"Bearer {res_token}"})
    assert res_guard_response.status_code == 403
    assert "Operation not permitted" in res_guard_response.json()["detail"]

    # Admin accesses Admin-only route (should be 200 OK)
    admin_guard_response = client.get("/api/test-admin-only", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_guard_response.status_code == 200
    assert admin_guard_response.json()["message"] == "Hello Admin!"
