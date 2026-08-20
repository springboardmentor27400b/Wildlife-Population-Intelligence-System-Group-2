import argparse
import logging
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.database.database import SessionLocal, engine, Base
from app.models.image_detection import ImageDetection
from app.models.audio_detection import AudioDetection
from app.models.taxonomy import Taxonomy

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def purge_fake_data():
    db = SessionLocal()
    try:
        # 1. Delete all old image detections
        image_count = db.query(ImageDetection).delete()
        logger.info(f"Purged {image_count} old image detections.")

        # 2. Delete all old audio detections
        audio_count = db.query(AudioDetection).delete()
        logger.info(f"Purged {audio_count} old audio detections.")

        # 3. We keep Taxonomy, but we can clear it and let the new pipeline reseed it,
        # or we can clear specific badly formatted ones. We will clear it entirely
        # so fetch_taxonomy can re-fetch them properly.
        tax_count = db.query(Taxonomy).delete()
        logger.info(f"Purged {tax_count} taxonomy records for a clean slate.")

        db.commit()
        logger.info("Fake data purge complete.")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to purge data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    purge_fake_data()
