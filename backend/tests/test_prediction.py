import pytest
import uuid
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.species_profile import SpeciesProfile
from app.core.seeding import seed_species_table

def get_auth_headers(client: TestClient, email: str, role: str) -> dict:
    reg_payload = {
        "email": email,
        "password": "testpassword123",
        "full_name": f"{role} User",
        "role": role
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_database_seeding(db_session: Session):
    """
    Verifies that seeding is idempotent and loads exactly 54 species when empty.
    """
    # SQLite starts empty, seed it
    seed_species_table(db_session)
    count = db_session.query(SpeciesProfile).count()
    assert count == 74
    
    # Run seeding again, verify count remains 74 (idempotent)
    seed_species_table(db_session)
    assert db_session.query(SpeciesProfile).count() == 74

def test_get_species_profiles(client: TestClient, db_session: Session):
    """
    Verifies that authenticated users can query species profiles list.
    """
    seed_species_table(db_session)
    headers = get_auth_headers(client, "researcher@example.com", "Wildlife Researcher")
    response = client.get("/api/v1/species", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0

def test_admin_crud_permissions(client: TestClient, db_session: Session):
    """
    Verifies that only users with the Administrator role can execute CRUD operations on species profiles.
    """
    seed_species_table(db_session)
    normal_headers = get_auth_headers(client, "normal_officer@example.com", "Conservation Officer")
    admin_headers = get_auth_headers(client, "admin_user@example.com", "Administrator")
    
    # 1. Non-admin create attempt -> should fail with FORBIDDEN (403)
    new_profile = {
        "common_name": "Test Species",
        "scientific_name": "Test_species",
        "taxonomy": {"kingdom": "Animalia", "family": "Test"},
        "habitat": "Test Habitat",
        "diet": "Herbivore",
        "lifespan": "10 years",
        "conservation_status": "Least Concern",
        "population_trend": "Stable",
        "population_estimate": "10,000",
        "threat_level": "Low",
        "native_regions": "Global",
        "interesting_facts": ["Fact 1"]
    }
    
    response = client.post("/api/v1/species", json=new_profile, headers=normal_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # 2. Admin create attempt -> should succeed (201)
    response = client.post("/api/v1/species", json=new_profile, headers=admin_headers)
    assert response.status_code == status.HTTP_201_CREATED
    created_id = response.json()["id"]
    
    # 3. Non-admin update attempt -> should fail (403)
    update_data = {"common_name": "Updated Test Species"}
    response = client.put(f"/api/v1/species/{created_id}", json=update_data, headers=normal_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # 4. Admin update attempt -> should succeed (200)
    response = client.put(f"/api/v1/species/{created_id}", json=update_data, headers=admin_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["common_name"] == "Updated Test Species"
    
    # 5. Non-admin delete attempt -> should fail (403)
    response = client.delete(f"/api/v1/species/{created_id}", headers=normal_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # 6. Admin delete attempt -> should succeed (200)
    response = client.delete(f"/api/v1/species/{created_id}", headers=admin_headers)
    assert response.status_code == status.HTTP_200_OK

def test_ecological_analysis_report(client: TestClient, db_session: Session):
    """
    Verifies the ecological report endpoint returns analysis parameters.
    """
    seed_species_table(db_session)
    headers = get_auth_headers(client, "eco_researcher@example.com", "Wildlife Researcher")
    response = client.get("/api/v1/ecological", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "species_richness" in data
    assert "dominant_species" in data
    assert "habitat_suitability_score" in data

def test_population_trends(client: TestClient, db_session: Session):
    """
    Verifies the population endpoint returns forecast trends and chart coordinates.
    """
    seed_species_table(db_session)
    headers = get_auth_headers(client, "pop_researcher@example.com", "Wildlife Researcher")
    response = client.get("/api/v1/population", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "population_density" in data
    assert "population_trend" in data
    assert "chart_data" in data

def test_conservation_recommendations(client: TestClient, db_session: Session):
    """
    Verifies that recommendations return policy suggestions.
    """
    seed_species_table(db_session)
    headers = get_auth_headers(client, "rec_researcher@example.com", "Wildlife Researcher")
    response = client.get("/api/v1/recommendations", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "illegal_hunting" in data
    assert "deforestation" in data
