import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, get_mongo_db
from app.models.sql import User, Survey, MonitoringSite, Device, Observation
from app.services.ai.prediction_persistence_service import persist_prediction
from bson.objectid import ObjectId

def test_relational_prediction_metadata_persistence():
    db = SessionLocal()
    mongo_db = get_mongo_db()

    try:
        # 1. Retrieve or setup valid PostgreSQL entities
        user = db.query(User).first()
        survey = db.query(Survey).first()
        site = db.query(MonitoringSite).first()
        device = db.query(Device).first()

        assert user is not None, "PostgreSQL User required for testing"
        assert survey is not None, "PostgreSQL Survey required for testing"
        assert site is not None, "PostgreSQL MonitoringSite required for testing"

        # -------------------------------------------------------------
        # UPLOAD 1: Valid Survey, Site, Device
        # -------------------------------------------------------------
        media_doc_1 = {
            "filename": "test_relational_media_1.jpg",
            "original_filename": "test_relational_media_1.jpg",
            "file_type": "image",
            "storage_path": "/media/test_relational_media_1.jpg",
            "uploaded_by": user.id,
            "survey_id": survey.id,
            "site_id": site.id,
            "device_id": device.id if device else None,
            "upload_status": "associated"
        }
        res_1 = mongo_db["uploaded_media"].insert_one(media_doc_1)
        media_id_1 = str(res_1.inserted_id)

        # Create matching Observation in PostgreSQL
        obs_1 = Observation(
            survey_id=survey.id,
            site_id=site.id,
            researcher_id=user.id,
            device_id=device.id if device else None,
            uploaded_images=["/media/test_relational_media_1.jpg"],
            uploaded_audio=[],
            observation_notes="Test observation 1"
        )
        db.add(obs_1)
        db.commit()
        db.refresh(obs_1)

        # Link observation_id to uploaded_media in MongoDB
        mongo_db["uploaded_media"].update_one(
            {"_id": ObjectId(media_id_1)},
            {"$set": {"observation_id": obs_1.id}}
        )

        dummy_inference_1 = {
            "detected_species": "Panthera leo",
            "scientific_name": "Panthera leo",
            "common_name": "Lion",
            "confidence": 0.95,
            "bounding_boxes": [{"x": 10, "y": 10}],
            "model_name": "YOLOv8",
            "model_version": "8.0"
        }

        pred_id_1 = persist_prediction(media_id_1, "image", dummy_inference_1, mongo_db)
        pred_doc_1 = mongo_db["predictions"].find_one({"_id": ObjectId(pred_id_1)})

        assert pred_doc_1 is not None
        assert pred_doc_1["user_id"] == user.id
        assert pred_doc_1["survey_id"] == survey.id
        assert pred_doc_1["monitoring_site_id"] == site.id
        assert pred_doc_1["observation_id"] == obs_1.id
        if device:
            assert pred_doc_1["device_id"] == device.id

        # -------------------------------------------------------------
        # UPLOAD 2: Same Survey, Site, Device -> Reuses IDs, new observation_id
        # -------------------------------------------------------------
        media_doc_2 = {
            "filename": "test_relational_media_2.jpg",
            "original_filename": "test_relational_media_2.jpg",
            "file_type": "image",
            "storage_path": "/media/test_relational_media_2.jpg",
            "uploaded_by": user.id,
            "survey_id": survey.id,
            "site_id": site.id,
            "device_id": device.id if device else None,
            "upload_status": "associated"
        }
        res_2 = mongo_db["uploaded_media"].insert_one(media_doc_2)
        media_id_2 = str(res_2.inserted_id)

        obs_2 = Observation(
            survey_id=survey.id,
            site_id=site.id,
            researcher_id=user.id,
            device_id=device.id if device else None,
            uploaded_images=["/media/test_relational_media_2.jpg"],
            uploaded_audio=[],
            observation_notes="Test observation 2"
        )
        db.add(obs_2)
        db.commit()
        db.refresh(obs_2)

        mongo_db["uploaded_media"].update_one(
            {"_id": ObjectId(media_id_2)},
            {"$set": {"observation_id": obs_2.id}}
        )

        pred_id_2 = persist_prediction(media_id_2, "image", dummy_inference_1, mongo_db)
        pred_doc_2 = mongo_db["predictions"].find_one({"_id": ObjectId(pred_id_2)})

        assert pred_doc_2["user_id"] == user.id
        assert pred_doc_2["survey_id"] == survey.id
        assert pred_doc_2["monitoring_site_id"] == site.id
        assert pred_doc_2["observation_id"] == obs_2.id
        assert obs_2.id != obs_1.id

        # -------------------------------------------------------------
        # UPLOAD 3: Intentionally No Device Associated (device_id=None)
        # -------------------------------------------------------------
        media_doc_3 = {
            "filename": "test_relational_media_nodevice.jpg",
            "original_filename": "test_relational_media_nodevice.jpg",
            "file_type": "image",
            "storage_path": "/media/test_relational_media_nodevice.jpg",
            "uploaded_by": user.id,
            "survey_id": survey.id,
            "site_id": site.id,
            "device_id": None,
            "upload_status": "associated"
        }
        res_3 = mongo_db["uploaded_media"].insert_one(media_doc_3)
        media_id_3 = str(res_3.inserted_id)

        obs_3 = Observation(
            survey_id=survey.id,
            site_id=site.id,
            researcher_id=user.id,
            device_id=None,
            uploaded_images=["/media/test_relational_media_nodevice.jpg"],
            uploaded_audio=[],
            observation_notes="Test observation 3 (No Device)"
        )
        db.add(obs_3)
        db.commit()
        db.refresh(obs_3)

        mongo_db["uploaded_media"].update_one(
            {"_id": ObjectId(media_id_3)},
            {"$set": {"observation_id": obs_3.id}}
        )

        pred_id_3 = persist_prediction(media_id_3, "image", dummy_inference_1, mongo_db)
        pred_doc_3 = mongo_db["predictions"].find_one({"_id": ObjectId(pred_id_3)})

        assert pred_doc_3["user_id"] == user.id
        assert pred_doc_3["survey_id"] == survey.id
        assert pred_doc_3["monitoring_site_id"] == site.id
        assert pred_doc_3["observation_id"] == obs_3.id
        assert pred_doc_3["device_id"] is None

        # Clean up test artifacts from MongoDB and PostgreSQL
        mongo_db["predictions"].delete_many({"_id": {"$in": [ObjectId(pred_id_1), ObjectId(pred_id_2), ObjectId(pred_id_3)]}})
        mongo_db["uploaded_media"].delete_many({"_id": {"$in": [ObjectId(media_id_1), ObjectId(media_id_2), ObjectId(media_id_3)]}})
        db.query(Observation).filter(Observation.id.in_([obs_1.id, obs_2.id, obs_3.id])).delete(synchronize_session=False)
        db.commit()

    finally:
        db.close()
