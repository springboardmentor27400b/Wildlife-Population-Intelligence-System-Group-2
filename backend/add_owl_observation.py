import uuid
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.monitoring_site import MonitoringSite
from app.models.observation import Observation
from app.models.media import Media
from app.models.species_profile import SpeciesProfile
from app.services.prediction_service import prediction_service

def add_owl():
    db = SessionLocal()
    try:
        # 1. Fetch Admin
        admin = db.query(User).filter(User.role == "Administrator").first()
        if not admin:
            print("No Admin user found. Please run database migrations first.")
            return

        # 2. Fetch or Create Monitoring Site
        site = db.query(MonitoringSite).first()
        if not site:
            print("No monitoring site found. Creating default 'Forest Site A'...")
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

        # 3. Verify Owl species profile exists
        owl_profile = db.query(SpeciesProfile).filter(SpeciesProfile.common_name == "Owl").first()
        if not owl_profile:
             print("Seeding baseline species profiles first...")
             from app.core.seeding import seed_species_table
             seed_species_table(db)
             owl_profile = db.query(SpeciesProfile).filter(SpeciesProfile.common_name == "Owl").first()
             
        # 4. Create Observation Sighting Record
        obs_id = uuid.uuid4()
        obs = Observation(
            id=obs_id,
            species="Owl",
            count=1,
            observed_at=datetime.now(timezone.utc),
            latitude=12.0358,
            longitude=76.1552,
            notes="Active owl observed nesting on oak branch during twilight patrol.",
            site_id=site.id,
            reporter_id=admin.id
        )
        db.add(obs)
        db.commit()
        db.refresh(obs)

        # 5. Create linked Media entry
        media_id = uuid.uuid4()
        media = Media(
            id=media_id,
            observation_id=obs_id,
            file_name="owl_nesting.jpg",
            file_url="/static/uploads/images/owl_nesting.jpg",
            mime_type="image/jpeg",
            file_size=40245,
            file_type="image"
        )
        db.add(media)
        db.commit()
        db.refresh(media)

        # Ensure directory folders exist in backend/uploads/images
        static_dir = os.path.join(os.path.dirname(__file__), "uploads", "images")
        os.makedirs(static_dir, exist_ok=True)
        placeholder_path = os.path.join(static_dir, "owl_nesting.jpg")
        
        # Create a beautiful 640x480 dark green forest-like background
        import numpy as np
        import cv2
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        # Forest green background (B=30, G=70, R=40)
        img[:, :] = [30, 70, 40]
        # Draw some subtle horizontal grid lines
        for y in range(0, 480, 40):
            cv2.line(img, (0, y), (640, y), (40, 85, 50), 1)
        # Write telemetry overlays
        cv2.putText(img, "NAGARHOLE NATIONAL PARK - ZONE A", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 255, 180), 2)
        cv2.putText(img, "CAM TRAP: ALPHA-01", (20, 70), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 255, 180), 1)
        cv2.putText(img, datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"), (20, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 255, 180), 1)
        # Draw target crosshair
        cv2.drawMarker(img, (320, 240), (100, 200, 120), cv2.MARKER_CROSS, 20, 2)
        cv2.imwrite(placeholder_path, img)

        # 6. Run Prediction to populate bounding box record
        print("Running AI species detection pipeline on Owl image...")
        prediction_service.predict(db, media)
        
        print(f"Observation logged successfully!")
        print(f"Sighting ID: {obs_id}")
        print(f"Species:     Owl")
        print(f"Coordinates: {obs.latitude}, {obs.longitude}")
        
    except Exception as e:
        db.rollback()
        print(f"Failed to log owl observation: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_owl()
