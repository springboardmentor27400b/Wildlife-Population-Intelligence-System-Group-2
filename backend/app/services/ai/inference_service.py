import os
import time
import uuid
import gridfs
from bson.objectid import ObjectId
from app.services.ai import model_loader, image_engine

def run_image_inference_pipeline(media_id: str, mongo_db=None) -> dict:
    start_time = time.time()
    """
    Orchestrates the complete image inference pipeline:
    1. If mongo_db is not provided and media_id is an existing local file path, runs inference directly.
    2. Otherwise, validates media_id as a valid ObjectId and fetches metadata from MongoDB.
    3. Validates that the media file is an image.
    4. Retrieves the media file from MongoDB GridFS using the gridfs_id.
    5. Reconstructs the media file locally under backend/app/media/.
    6. Executes the Stage 1 and Stage 2 models on the reconstructed file.
    7. Returns structured prediction results.
    8. Guarantees cleanup of the temporary local file created.
    """
    # Local fallback for tests/scripts running directly against files without DB
    if mongo_db is None and os.path.exists(media_id):
        det_model = model_loader.get_detection_model()
        class_model = model_loader.get_classification_model()
        class_transforms = model_loader.get_classification_transforms()
        class_labels = model_loader.get_classification_labels()
        device = model_loader.get_device()

        from app.services.ai.image_quality_service import analyze_image_quality
        results = image_engine.run_image_inference(
            image_path=media_id,
            det_model=det_model,
            class_model=class_model,
            class_transforms=class_transforms,
            class_labels=class_labels,
            device=device
        )
        results["image_quality"] = analyze_image_quality(media_id)
        return results

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

    # 3. Validate that the media is an image
    file_type = media_doc.get("file_type")
    mime_type = media_doc.get("mime_type", "")
    is_image = (file_type == "image") or (mime_type and mime_type.startswith("image/"))
    if not is_image:
        raise ValueError(f"The media file with ID '{media_id}' is not an image (type: '{file_type}', mime: '{mime_type}').")

    gridfs_id_str = media_doc.get("gridfs_id")
    if not gridfs_id_str:
        raise ValueError(f"No gridfs_id reference associated with media record: '{media_id}'")

    # 4. Retrieve file bytes from GridFS
    fs = gridfs.GridFS(mongo_db)
    try:
        grid_out = fs.get(ObjectId(gridfs_id_str))
        file_bytes = grid_out.read()
    except Exception as e:
        raise IOError(f"Failed to retrieve file from GridFS for gridfs_id '{gridfs_id_str}': {e}")

    # 5. Reconstruct local media file
    import tempfile
    media_dir = os.path.join(tempfile.gettempdir(), "wildlife_media")
    os.makedirs(media_dir, exist_ok=True)

    # Resolve file extension from original or saved filename
    filename = media_doc.get("filename") or media_doc.get("original_filename") or "image.jpg"
    _, ext = os.path.splitext(filename)
    if not ext:
        ext = ".jpg"

    # Define unique temporary file path to prevent collision
    temp_filename = f"inference_temp_{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(media_dir, temp_filename)

    try:
        # Write file bytes to temporary file
        with open(temp_path, "wb") as f:
            f.write(file_bytes)

        # 6. Obtain preloaded models
        det_model = model_loader.get_detection_model()
        class_model = model_loader.get_classification_model()
        class_transforms = model_loader.get_classification_transforms()
        class_labels = model_loader.get_classification_labels()
        device = model_loader.get_device()

        # 7. Call image quality analysis and image engine
        from app.services.ai.image_quality_service import analyze_image_quality
        quality_results = analyze_image_quality(temp_path)

        results = image_engine.run_image_inference(
            image_path=temp_path,
            det_model=det_model,
            class_model=class_model,
            class_transforms=class_transforms,
            class_labels=class_labels,
            device=device
        )
        results["image_quality"] = quality_results

        # 8. Add database/metadata keys to the results
        results["survey_id"] = media_doc.get("survey_id")
        results["site_id"] = media_doc.get("site_id")
        results["device_id"] = media_doc.get("device_id")
        results["gridfs_id"] = gridfs_id_str
        results["media_id"] = media_id
        results["model_name"] = "ResNet50 / FasterRCNN"
        results["model_version"] = "1.0"
        results["inference_time_ms"] = (time.time() - start_time) * 1000

        # Persist prediction to MongoDB
        if mongo_db is not None:
            from app.services.ai.prediction_persistence_service import persist_prediction
            prediction_id = persist_prediction(
                media_id=media_id,
                media_type="image",
                inference_result=results,
                mongo_db=mongo_db
            )
            results["prediction_id"] = prediction_id

        return results

    finally:
        # 9. Local file cleanup guarantee
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
