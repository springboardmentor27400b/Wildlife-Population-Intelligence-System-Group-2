import uuid
import os
import urllib.request
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.monitoring_site import MonitoringSite
from app.models.observation import Observation
from app.models.media import Media
from app.models.species_profile import SpeciesProfile
from app.services.prediction_service import prediction_service

def seed_tiger():
    db = SessionLocal()
    try:
        # 1. Fetch Admin
        admin = db.query(User).filter(User.role == "Administrator").first()
        if not admin:
            print("No Admin user found.")
            return

        # 2. Fetch or Create Monitoring Site
        site = db.query(MonitoringSite).first()
        if not site:
            site = MonitoringSite(
                id=uuid.uuid4(),
                name="Nagarhole Zone A",
                latitude=12.035,
                longitude=76.155,
                habitat_type="FOREST",
                description="Primary monitoring zone near the Kabini river with dense forest cover.",
                status="ACTIVE"
            )
            db.add(site)
            db.commit()
            db.refresh(site)

        # Ensure directory folders exist
        static_dir = os.path.join(os.path.dirname(__file__), "uploads", "images")
        os.makedirs(static_dir, exist_ok=True)
        placeholder_path = os.path.join(static_dir, "tiger_family.jpg")
        
        # Download real Bengal Tiger photo from Wikimedia Commons
        print("Downloading a real photograph of a Bengal Tiger from public commons...")
        tiger_url = "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=640"
        
        # Set user agent headers to prevent HTTP 403 blocks during retrieval
        req = urllib.request.Request(
            tiger_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response, open(placeholder_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Tiger image downloaded successfully to: {placeholder_path}")

        # 3. Create Sighting with Count: 5
        obs_id = uuid.uuid4()
        obs = Observation(
            id=obs_id,
            species="Bengal Tiger",
            count=5,
            observed_at=datetime.now(timezone.utc),
            latitude=12.0358,
            longitude=76.1552,
            notes="Camera trap trigger capturing a Bengal Tiger traversing the national park path.",
            site_id=site.id,
            reporter_id=admin.id
        )
        db.add(obs)
        db.commit()
        db.refresh(obs)

        # 4. Create linked Media entry
        media_id = uuid.uuid4()
        media = Media(
            id=media_id,
            observation_id=obs_id,
            file_name="tiger_family.jpg",
            file_url="/static/uploads/images/tiger_family.jpg",
            mime_type="image/jpeg",
            file_size=os.path.getsize(placeholder_path),
            file_type="image"
        )
        db.add(media)
        db.commit()
        db.refresh(media)

        # 5. Run Prediction (creates 5 bounding boxes overlaying the real tiger image)
        print("Running updated prediction service on the real tiger photo...")
        result = prediction_service.predict(db, media)
        
        print("\n" + "="*80)
        print("REAL TIGER OBSERVATION SEEDED SUCCESSFULLY!")
        print("="*80)
        print(f"Observation ID: {obs_id}")
        print(f"Species:        Bengal Tiger")
        print(f"Sighting Count: 5")
        print(f"Detections:     {result['number_of_animals_detected']} bounding boxes")
        print(f"Top-5 Classifications (Sorted):")
        for pred in result['top_predictions']:
            print(f"  - {pred['common_name']}: {pred['confidence']:.2%}")
        print("\nTo download the PDF report:")
        print(f"  URL: http://127.0.0.1:8000/api/v1/reports/{result['detection_id']}/download")
        print("="*80 + "\n")
        
    except Exception as e:
        db.rollback()
        print(f"Failed to seed Tiger: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_tiger()
