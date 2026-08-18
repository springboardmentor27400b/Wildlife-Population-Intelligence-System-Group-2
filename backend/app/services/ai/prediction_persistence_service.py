import logging
from datetime import datetime
from bson.objectid import ObjectId
from app.core.database import SessionLocal
from app.models.sql import Observation, User, Survey, MonitoringSite, Device

logger = logging.getLogger("prediction_persistence")

def persist_prediction(
    media_id: str,
    media_type: str,
    inference_result: dict,
    mongo_db
) -> str:
    """
    Persists AI prediction results in MongoDB 'predictions' collection.
    Looks up survey, site, device, user, and observation metadata from PostgreSQL.
    Ensures relational fields are populated and valid.
    """
    # 1. Retrieve the uploaded media metadata from MongoDB Atlas
    try:
        media_oid = ObjectId(media_id)
    except Exception as e:
        logger.error(f"Invalid media ID format: '{media_id}' for persistence: {e}")
        raise ValueError(f"Invalid media ID format: '{media_id}'")

    media_doc = mongo_db["uploaded_media"].find_one({"_id": media_oid})
    if not media_doc:
        logger.error(f"Uploaded media record not found for ID: '{media_id}'")
        raise ValueError(f"Uploaded media record not found for ID: '{media_id}'")

    # Extract relational IDs from media_doc metadata
    user_id = media_doc.get("uploaded_by")
    survey_id = media_doc.get("survey_id")
    site_id = media_doc.get("site_id") or media_doc.get("monitoring_site_id")
    device_id = media_doc.get("device_id")
    observation_id = media_doc.get("observation_id")

    filename = media_doc.get("filename") or media_doc.get("original_filename") or ""
    storage_path = media_doc.get("storage_path") or (f"/media/{filename}" if filename else "")

    # 2. Query/Validate relational PostgreSQL entities
    db = None
    try:
        db = SessionLocal()
        obs = None
        if observation_id:
            obs = db.query(Observation).filter(Observation.id == observation_id).first()

        if not obs and storage_path:
            # Query PostgreSQL Observation table for matching storage_path or filename safely
            all_obs = db.query(Observation).all()
            for o in all_obs:
                imgs = o.uploaded_images or []
                auds = o.uploaded_audio or []
                all_paths = [str(p) for p in (imgs + auds)]
                if any((storage_path in p or (filename and filename in p)) for p in all_paths):
                    obs = o
                    break

        if obs:
            observation_id = obs.id
            user_id = user_id or obs.researcher_id
            survey_id = survey_id or obs.survey_id
            site_id = site_id or obs.site_id
            device_id = device_id if device_id is not None else obs.device_id

        # Auto-resolve survey_id and site_id if missing for standalone uploads
        if not survey_id and user_id:
            default_surv = db.query(Survey).filter(Survey.created_by == user_id).first()
            if not default_surv:
                default_surv = db.query(Survey).first()
            if default_surv:
                survey_id = default_surv.id
            else:
                new_surv = Survey(title="General Wildlife Survey", created_by=user_id, status="Active")
                db.add(new_surv)
                db.commit()
                db.refresh(new_surv)
                survey_id = new_surv.id

        if not site_id:
            default_site = db.query(MonitoringSite).first()
            if default_site:
                site_id = default_site.id
            else:
                new_site = MonitoringSite(name="General Monitoring Site", latitude=0.0, longitude=0.0)
                db.add(new_site)
                db.commit()
                db.refresh(new_site)
                site_id = new_site.id

        # If observation_id is missing, create ONE PostgreSQL Observation record to guarantee traceability
        if not observation_id and user_id and survey_id and site_id:
            new_obs = Observation(
                survey_id=survey_id,
                site_id=site_id,
                researcher_id=user_id,
                device_id=device_id,
                uploaded_images=[storage_path] if media_type == "image" else [],
                uploaded_audio=[storage_path] if media_type == "audio" else [],
                observation_notes="Observation created automatically for AI prediction media asset."
            )
            db.add(new_obs)
            db.commit()
            db.refresh(new_obs)
            observation_id = new_obs.id

            # Sync observation_id, survey_id, site_id back to uploaded_media document in MongoDB
            mongo_db["uploaded_media"].update_one(
                {"_id": media_oid},
                {"$set": {"observation_id": observation_id, "survey_id": survey_id, "site_id": site_id}}
            )

    except Exception as e:
        logger.warning(f"PostgreSQL relational metadata resolution skipped: {e}")
        if db:
            try:
                db.rollback()
            except Exception:
                pass
    finally:
        if db:
            try:
                db.close()
            except Exception:
                pass

    # 3. Build prediction document with exact PostgreSQL IDs
    prediction_doc = {
        "observation_id": observation_id,
        "uploaded_media_id": media_id,
        "media_type": media_type,
        "user_id": user_id,
        "survey_id": survey_id,
        "monitoring_site_id": site_id,
        "device_id": device_id,
        "prediction_timestamp": datetime.utcnow().isoformat(),
        "primary_species": inference_result.get("detected_species"),
        "scientific_name": inference_result.get("scientific_name"),
        "common_name": inference_result.get("common_name"),
        "confidence": inference_result.get("confidence"),
        "species_prediction": inference_result.get("species_prediction"),
        "top5_predictions": inference_result.get("top5_predictions"),
        "taxonomy": inference_result.get("taxonomy"),
        "model_name": inference_result.get("model_name"),
        "model_version": inference_result.get("model_version"),
        "inference_time_ms": inference_result.get("inference_time_ms"),
        "processing_status": "completed"
    }

    if media_type == "image":
        prediction_doc["number_of_animals_detected"] = len(inference_result.get("bounding_boxes", []))
        prediction_doc["bounding_box_count"] = len(inference_result.get("bounding_boxes", []))
        prediction_doc["image_quality"] = inference_result.get("image_quality")
    elif media_type == "audio":
        prediction_doc["number_of_acoustic_events"] = len(inference_result.get("detected_events", []))
        prediction_doc["audio_quality"] = inference_result.get("audio_quality")

    # 4. Save to MongoDB collection 'predictions'
    try:
        res = mongo_db["predictions"].insert_one(prediction_doc)
        prediction_id = str(res.inserted_id)
        logger.info(f"AI Prediction successfully persisted for media {media_id}. Prediction ID: {prediction_id}")
        return prediction_id
    except Exception as e:
        logger.error(f"Failed to insert prediction into MongoDB 'predictions' collection: {e}")
        raise IOError(f"Failed to persist prediction in database: {e}")
