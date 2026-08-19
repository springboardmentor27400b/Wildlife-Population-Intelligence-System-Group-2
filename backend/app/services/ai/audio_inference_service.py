import os
import uuid
import time
import logging
import gridfs
from datetime import datetime
from bson.objectid import ObjectId
from app.services.ai.audio_quality_service import analyze_audio_quality
from app.services.ai.birdnet_engine import run_birdnet_inference
from app.services.ai.animalclap_engine import run_animalclap_inference

logger = logging.getLogger("audio_inference")

def run_audio_inference(audio_path: str, analysis_type: str = "bird") -> dict:
    """
    Runs bioacoustic inference on target audio.
    Bird Audio (analysis_type == 'bird'): BirdNET exclusively.
    Other Wildlife Audio (analysis_type == 'wildlife'): AnimalCLAP exclusively.
    """
    if analysis_type == "bird":
        logger.info("Selected inference engine: BirdNET")
        print("INFO: Selected inference engine: BirdNET")
        res = run_birdnet_inference(audio_path)
        res["source_model"] = "BirdNET"
        res["fallback_used"] = False

        # Post-inference decision logic: BirdNET confidence threshold (75%)
        conf = res.get("confidence", 0.0)
        res["confidence_threshold"] = 75
        if conf >= 0.75:
            res["is_low_confidence"] = False
        else:
            res["is_low_confidence"] = True
            res["detected_species"] = "Unknown Species Detected"
            res["common_name"] = "Unknown Species Detected"
            res["scientific_name"] = "N/A"
            res["status"] = "Low Confidence Prediction"
            res["reason"] = "BirdNET confidence below identification threshold."
            if "taxonomy" in res and isinstance(res["taxonomy"], dict):
                res["taxonomy"]["genus"] = "N/A"
                res["taxonomy"]["species"] = "N/A"
                res["taxonomy"]["scientific_name"] = "N/A"
                res["taxonomy"]["common_name"] = "Unknown Species Detected"
            
            # Scrub detected_events and top5_predictions to prevent raw low-confidence species leaking
            if "detected_events" in res and isinstance(res["detected_events"], list):
                for evt in res["detected_events"]:
                    evt["species"] = "Unknown Species Detected"
                    evt["common_name"] = "Unknown Species Detected"
                    evt["scientific_name"] = "N/A"

            if "top5_predictions" in res and isinstance(res["top5_predictions"], list):
                for pred in res["top5_predictions"]:
                    pred["species"] = "Unknown Species Detected"
                    pred["common_name"] = "Unknown Species Detected"
                    pred["scientific_name"] = "N/A"
        return res
    elif analysis_type == "wildlife":
        logger.info("Selected inference engine: AnimalCLAP")
        try:
            animalclap_res = run_animalclap_inference(audio_path)
            raw_conf = animalclap_res.get("confidence", 0.0)
            conf = float(raw_conf) / 100.0 if float(raw_conf) > 1.0 else float(raw_conf)
        except Exception as e:
            logger.warning(f"AnimalCLAP execution error: {e}. Gracefully falling back to YAMNet.")
            print(f"WARNING: AnimalCLAP execution error: {e}. Gracefully falling back to YAMNet.")
            conf = 0.0
            animalclap_res = {
                "detected_species": "Unknown Wildlife",
                "scientific_name": "N/A",
                "common_name": "Unknown Wildlife",
                "confidence": 0.0,
                "is_low_confidence": True,
                "confidence_threshold": 60,
                "status": "Inference Fallback",
                "reason": f"AnimalCLAP fallback ({e})",
                "source_model": "YAMNet (Fallback)",
                "classification_source": "YAMNet",
                "classification_level": "animal_category",
                "animal_category": "Unknown Wildlife",
                "fallback_used": True,
                "top5_predictions": [],
                "detected_events": [],
                "audio_quality": {},
                "taxonomy": {"species": "N/A", "scientific_name": "N/A", "common_name": "Unknown Wildlife"}
            }

        # 60% Confidence Threshold check for AnimalCLAP (0.60)
        if conf >= 0.60:
            animalclap_res["source_model"] = "AnimalCLAP"
            animalclap_res["classification_source"] = "AnimalCLAP"
            animalclap_res["classification_level"] = "species"
            animalclap_res["fallback_used"] = False
            animalclap_res["animal_category"] = None
            return animalclap_res
        else:
            logger.info(f"AnimalCLAP confidence ({conf*100:.1f}%) below 60% threshold. Invoking YAMNet category fallback...")
            print(f"INFO: AnimalCLAP confidence ({conf*100:.1f}%) < 60%. Invoking YAMNet category fallback...")
            from app.services.ai.yamnet_engine import run_yamnet_inference
            yamnet_res = run_yamnet_inference(audio_path)

            cat_name = yamnet_res["animal_category"]
            cat_conf = yamnet_res["confidence"]

            animalclap_res["source_model"] = "YAMNet (Fallback)"
            animalclap_res["classification_source"] = "YAMNet"
            animalclap_res["classification_level"] = "animal_category"
            animalclap_res["fallback_used"] = True
            animalclap_res["animal_category"] = cat_name
            animalclap_res["confidence"] = cat_conf
            
            # Species name must NOT be displayed in fallback mode
            animalclap_res["detected_species"] = cat_name
            animalclap_res["common_name"] = cat_name
            animalclap_res["scientific_name"] = "N/A"
            animalclap_res["is_low_confidence"] = (cat_name == "Unknown Wildlife")
            animalclap_res["status"] = "Category Fallback Classification"
            animalclap_res["reason"] = f"AnimalCLAP confidence ({conf*100:.1f}%) below 60% threshold. Classified into broad category '{cat_name}' using YAMNet."

            # Scrub detected events & top5 predictions when fallback is used
            animalclap_res["detected_events"] = []
            animalclap_res["top5_predictions"] = []

            if "taxonomy" in animalclap_res and isinstance(animalclap_res["taxonomy"], dict):
                animalclap_res["taxonomy"]["species"] = "N/A"
                animalclap_res["taxonomy"]["scientific_name"] = "N/A"
                animalclap_res["taxonomy"]["common_name"] = cat_name

            return animalclap_res
    else:
        logger.error(f"Invalid analysis_type: '{analysis_type}'. Must be 'bird' or 'wildlife'.")
        raise ValueError(f"Invalid analysis_type: '{analysis_type}'. Supported engines are 'bird' (BirdNET) or 'wildlife' (AnimalCLAP).")

def run_audio_inference_pipeline(media_id: str, mongo_db=None, analysis_type: str = "bird") -> dict:
    """
    Orchestrates the complete audio inference pipeline with YAMNet fallback support.
    """
    if analysis_type not in ["bird", "wildlife"]:
        raise ValueError(f"Invalid analysis_type: '{analysis_type}'. Supported engines are 'bird' (BirdNET) or 'wildlife' (AnimalCLAP).")

    start_time = time.time()
    default_model_name = "AnimalCLAP" if analysis_type == "wildlife" else "BirdNET"
    default_model_version = "1.0" if analysis_type == "wildlife" else "2.4"

    # Local fallback for tests/scripts running directly against files without DB
    if mongo_db is None and os.path.exists(media_id):
        results = run_audio_inference(media_id, analysis_type=analysis_type)
        inference_time_ms = (time.time() - start_time) * 1000
        
        return {
            "detected_species": results["detected_species"],
            "scientific_name": results.get("scientific_name"),
            "common_name": results.get("common_name"),
            "confidence": results["confidence"],
            "is_low_confidence": results.get("is_low_confidence", False),
            "confidence_threshold": results.get("confidence_threshold", 75),
            "status": results.get("status"),
            "reason": results.get("reason"),
            "source_model": results.get("source_model", default_model_name),
            "classification_source": results.get("classification_source", "AnimalCLAP" if analysis_type == "wildlife" else "BirdNET"),
            "classification_level": results.get("classification_level", "species"),
            "animal_category": results.get("animal_category"),
            "fallback_used": results.get("fallback_used", False),
            "top5_predictions": results["top5_predictions"],
            "detected_events": results["detected_events"],
            "audio_quality": results["audio_quality"],
            "taxonomy": results.get("taxonomy"),
            "inference_time_ms": inference_time_ms,
            "model_name": results.get("source_model", default_model_name),
            "model_version": default_model_version,
            "prediction_timestamp": datetime.utcnow().isoformat()
        }

    if mongo_db is None:
        raise ValueError("MongoDB client must be provided when running inference via media_id.")

    # 1. Parse and validate media_id
    try:
        media_oid = ObjectId(media_id)
    except Exception:
        raise ValueError(f"Invalid media ID format: '{media_id}'. Must be a 24-character hex string.")

    # 2. Fetch metadata from uploaded_media collection
    media_doc = mongo_db["uploaded_media"].find_one({"_id": media_oid})
    if not media_doc:
        raise ValueError(f"Uploaded media record not found for ID: '{media_id}'")

    # 3. Validate that the media is an audio file
    file_type = media_doc.get("file_type")
    mime_type = media_doc.get("mime_type", "")
    is_audio = (file_type == "audio") or (mime_type and mime_type.startswith("audio/"))
    if not is_audio:
        raise ValueError(f"The media file with ID '{media_id}' is not audio (type: '{file_type}', mime: '{mime_type}').")

    gridfs_id_str = media_doc.get("gridfs_id")
    if not gridfs_id_str:
        raise ValueError(f"GridFS file ID missing from media document metadata for media ID '{media_id}'.")

    try:
        gridfs_id = ObjectId(gridfs_id_str)
    except Exception:
        raise ValueError(f"Invalid GridFS ID format: '{gridfs_id_str}' in media document metadata.")

    # 4. Reconstruct the media file locally under temp directory
    import tempfile
    media_dir = os.path.join(tempfile.gettempdir(), "wildlife_media")
    os.makedirs(media_dir, exist_ok=True)

    original_filename = media_doc.get("original_filename", "audio.wav")
    file_ext = os.path.splitext(original_filename)[1] or ".wav"
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_file_path = os.path.join(media_dir, temp_filename)

    fs = gridfs.GridFS(mongo_db)
    try:
        grid_out = fs.get(gridfs_id)
    except gridfs.errors.NoFile:
        raise IOError(f"GridFS file record not found for ID: '{gridfs_id}'")

    # Write GridFS binary chunks to local disk
    try:
        with open(temp_file_path, "wb") as f:
            f.write(grid_out.read())
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise IOError(f"Failed to write GridFS contents to local storage: {str(e)}")

    # 5. Run bioacoustic analysis pipeline
    try:
        results = run_audio_inference(temp_file_path, analysis_type=analysis_type)
        inference_time_ms = (time.time() - start_time) * 1000
        
        res_dict = {
            "detected_species": results["detected_species"],
            "scientific_name": results.get("scientific_name"),
            "common_name": results.get("common_name"),
            "confidence": results["confidence"],
            "is_low_confidence": results.get("is_low_confidence", False),
            "confidence_threshold": results.get("confidence_threshold", 75),
            "status": results.get("status"),
            "reason": results.get("reason"),
            "source_model": results.get("source_model", default_model_name),
            "classification_source": results.get("classification_source", "AnimalCLAP" if analysis_type == "wildlife" else "BirdNET"),
            "classification_level": results.get("classification_level", "species"),
            "animal_category": results.get("animal_category"),
            "fallback_used": results.get("fallback_used", False),
            "top5_predictions": results["top5_predictions"],
            "detected_events": results["detected_events"],
            "audio_quality": results["audio_quality"],
            "taxonomy": results.get("taxonomy"),
            "inference_time_ms": inference_time_ms,
            "model_name": results.get("source_model", default_model_name),
            "model_version": default_model_version,
            "prediction_timestamp": datetime.utcnow().isoformat()
        }

        # Persist prediction to MongoDB
        if mongo_db is not None:
            from app.services.ai.prediction_persistence_service import persist_prediction
            prediction_id = persist_prediction(
                media_id=media_id,
                media_type="audio",
                inference_result=res_dict,
                mongo_db=mongo_db
            )
            res_dict["prediction_id"] = prediction_id

        return res_dict
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

