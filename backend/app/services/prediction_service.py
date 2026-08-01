import os
import uuid
import time
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, Request
from PIL import Image, UnidentifiedImageError
from app.models.prediction import PredictionRecord, TopPrediction
from app.models.observation import ObservationRecord
from app.models.notification import Notification
from app.models.user import User
from app.ml.predictor import predict_species, validate_image_bytes, SUPPORTED_EXTENSIONS
from app.utils.audit import create_audit_log
from beanie import PydanticObjectId

PREDICTIONS_UPLOAD_DIR = "uploads/predictions"
os.makedirs(PREDICTIONS_UPLOAD_DIR, exist_ok=True)


class PredictionService:

    @staticmethod
    async def process_and_predict(
        file: UploadFile,
        source: str,
        current_user: User,
        request: Request
    ) -> PredictionRecord:
        """
        Full pipeline:
          1. Validate file extension and size
          2. Validate image integrity (in-memory, before saving)
          3. Save to disk
          4. Run ML inference
          5. Persist PredictionRecord to MongoDB
          6. Fire notifications
        """
        # ── 1. Extension check ────────────────────────────────────────────
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        if ext not in SUPPORTED_EXTENSIONS:
            await _audit_failed(current_user, request,
                                f"Unsupported file extension .{ext}")
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Please upload a {', '.join(f'.{e}' for e in SUPPORTED_EXTENSIONS)} image."
            )

        # ── 2. Read content + size check ─────────────────────────────────
        max_size = 20 * 1024 * 1024  # 20 MB
        content = await file.read()
        file_size = len(content)

        if file_size > max_size:
            await _audit_failed(current_user, request,
                                "File size exceeds 20 MB limit")
            raise HTTPException(
                status_code=400,
                detail="File size exceeds the 20 MB limit."
            )

        # ── 3. In-memory image integrity validation ───────────────────────
        try:
            validate_image_bytes(content)
        except ValueError:
            await _audit_failed(current_user, request,
                                "Corrupted or invalid image file")
            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted image file. Please upload a valid image."
            )

        # ── 4. Save to disk ───────────────────────────────────────────────
        unique_filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(PREDICTIONS_UPLOAD_DIR, unique_filename)
        file_url = f"/uploads/predictions/{unique_filename}"

        try:
            with open(file_path, "wb") as buffer:
                buffer.write(content)

            # ── 5. Run ML inference ───────────────────────────────────────
            start_time = time.time()
            try:
                result = predict_species(file_path)
            except Exception as e:
                await _audit_failed(current_user, request,
                                    f"Model prediction error: {str(e)}", severity="ERROR")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error running prediction model: {str(e)}"
                )
            end_time = time.time()
            prediction_time = round(end_time - start_time, 3)

            if "error" in result:
                await _audit_failed(current_user, request,
                                    f"Prediction returned error: {result['error']}", severity="ERROR")
                raise HTTPException(status_code=500, detail=result["error"])

            # ── 6. Resolve prediction_timestamp from result ───────────────
            prediction_ts = None
            raw_ts = result.get("prediction_timestamp")
            if raw_ts:
                try:
                    prediction_ts = datetime.fromisoformat(raw_ts)
                except Exception:
                    prediction_ts = datetime.now(timezone.utc)
            else:
                prediction_ts = datetime.now(timezone.utc)

            # ── 7. Build and save PredictionRecord ────────────────────────
            from app.models.prediction import AnimalDetection
            
            top_predictions = [
                TopPrediction(species=p["species"], confidence=p["confidence"])
                for p in result.get("top_predictions", [])
            ]
            top_3 = top_predictions[:3]
            
            detections = [
                AnimalDetection(
                    species=d["species"],
                    confidence=d["confidence"],
                    bbox=d["bbox"],
                    behaviour=d["behaviour"]
                ) for d in result.get("detections", [])
            ]

            prediction_record = PredictionRecord(
                species_name=result["predicted_category"],
                confidence_score=result["confidence"],
                prediction_time=prediction_time,
                prediction_timestamp=prediction_ts,
                model_version="1.0.0",
                top_3_predictions=top_3,
                top_predictions=top_predictions,
                file_name=file.filename,
                file_url=file_url,
                image_width=result.get("image_width"),
                image_height=result.get("image_height"),
                image_source=source,
                image_quality=result.get("image_quality", "Unknown"),
                quality_metrics=result.get("quality_metrics", {}),
                detection_source=result.get("detection_source", "Simulation"),
                animal_count=result.get("animal_count", 1),
                detections=detections,
                status="Pending",
                user_id=str(current_user.id),
                user_name=current_user.full_name
            )
            await prediction_record.insert()

            # ── 8. Audit success ──────────────────────────────────────────
            create_audit_log(
                user=current_user,
                request=request,
                action="PREDICTION_EXECUTED",
                module="Predictions",
                description=f"AI prediction executed successfully for {file.filename}. "
                            f"Species: {result['predicted_category']} ({result['confidence']}%).",
                resource_id=str(prediction_record.id),
                status="Success",
                severity="INFO"
            )

            # ── 9. Notifications ──────────────────────────────────────────
            if result["confidence"] >= 90.0:
                high_conf_notif = Notification(
                    title="High Confidence Detection",
                    message=f"High confidence ({result['confidence']}%) AI detection of {result['predicted_category']}.",
                    type="prediction",
                    priority="Success",
                    user_id=str(current_user.id),
                    related_resource_id=str(prediction_record.id)
                )
                await high_conf_notif.insert()

            rare_species = {
                "Apex Predators", "Cold-Climate Survivors",
                "Stealth & Shadows", "Tough Defenders"
            }
            if result["predicted_category"] in rare_species:
                rare_notif = Notification(
                    title="Rare Species Detection",
                    message=f"AI model detected potential rare/critical category: {result['predicted_category']}.",
                    type="alert",
                    priority="High",
                    user_id=str(current_user.id),
                    related_resource_id=str(prediction_record.id)
                )
                await rare_notif.insert()

            return prediction_record

        except Exception as e:
            # Cleanup on failure
            if os.path.exists(file_path):
                os.remove(file_path)
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process prediction: {str(e)}"
            )

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    async def save_as_observation(
        prediction_id: str,
        site_id: str,
        site_name: str,
        current_user: User,
        request: Request
    ) -> ObservationRecord:
        """Create a new ObservationRecord from a prediction and link them."""
        prediction = await _get_prediction_or_404(prediction_id)

        if prediction.status == "Saved":
            raise HTTPException(
                status_code=400,
                detail="Prediction has already been saved as an observation"
            )

        observation = ObservationRecord(
            species_name=prediction.species_name,
            scientific_name=prediction.species_name,
            observation_type="AI Recognition",
            monitoring_site_id=site_id,
            monitoring_site_name=site_name,
            observed_at=datetime.now(timezone.utc),
            observer_id=str(current_user.id),
            observer_name=current_user.full_name,
            count=1,
            confidence_score=prediction.confidence_score,
            file_name=prediction.file_name,
            file_url=prediction.file_url,
            notes=f"Created automatically from AI Prediction (ID: {prediction_id})",
            verification_status="Pending Verification",
            prediction_id=prediction_id,
            prediction_source="AI"
        )
        await observation.insert()

        # Update prediction record
        prediction.status = "Saved"
        prediction.observation_id = str(observation.id)
        prediction.updated_at = datetime.now(timezone.utc)
        await prediction.save()

        create_audit_log(
            user=current_user,
            request=request,
            action="PREDICTION_SAVED",
            module="Predictions",
            description=f"Saved prediction {prediction_id} as new observation {observation.id}.",
            resource_id=str(prediction_id),
            status="Success",
            severity="SUCCESS"
        )

        saved_notif = Notification(
            title="Prediction Saved Successfully",
            message=f"Prediction of {prediction.species_name} saved as new observation record.",
            type="prediction",
            priority="Success",
            user_id=str(current_user.id),
            related_resource_id=str(observation.id)
        )
        await saved_notif.insert()

        return observation

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    async def link_to_observation(
        prediction_id: str,
        observation_id: str,
        current_user: User,
        request: Request
    ) -> dict:
        """
        Link an AI prediction to an *existing* ObservationRecord.
        - Sets prediction_id and prediction_source on the observation.
        - Sets observation_id and status='Saved' on the prediction.
        """
        prediction = await _get_prediction_or_404(prediction_id)

        if prediction.status == "Saved":
            raise HTTPException(
                status_code=400,
                detail="Prediction is already linked to an observation."
            )

        # Validate the target observation exists
        try:
            obs_obj_id = PydanticObjectId(observation_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid observation ID format.")

        observation = await ObservationRecord.get(obs_obj_id)
        if not observation:
            raise HTTPException(status_code=404, detail="Observation record not found.")

        # Link prediction → observation
        observation.prediction_id = prediction_id
        observation.prediction_source = "AI"
        if not observation.confidence_score:
            observation.confidence_score = prediction.confidence_score
        observation.updated_at = datetime.now(timezone.utc)
        await observation.save()

        # Update prediction → observation
        prediction.observation_id = observation_id
        prediction.status = "Saved"
        prediction.updated_at = datetime.now(timezone.utc)
        await prediction.save()

        create_audit_log(
            user=current_user,
            request=request,
            action="PREDICTION_LINKED",
            module="Predictions",
            description=f"Prediction {prediction_id} linked to existing observation {observation_id}.",
            resource_id=prediction_id,
            status="Success",
            severity="SUCCESS"
        )

        linked_notif = Notification(
            title="Prediction Linked to Observation",
            message=f"AI prediction of {prediction.species_name} linked to observation record.",
            type="prediction",
            priority="Success",
            user_id=str(current_user.id),
            related_resource_id=observation_id
        )
        await linked_notif.insert()

        return {
            "message": "Prediction successfully linked to existing observation.",
            "prediction_id": prediction_id,
            "observation_id": observation_id
        }

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    async def discard_prediction(
        prediction_id: str,
        current_user: User,
        request: Request
    ) -> PredictionRecord:
        """Mark a prediction as Discarded."""
        prediction = await _get_prediction_or_404(prediction_id)

        prediction.status = "Discarded"
        prediction.updated_at = datetime.now(timezone.utc)
        await prediction.save()

        create_audit_log(
            user=current_user,
            request=request,
            action="PREDICTION_DISCARDED",
            module="Predictions",
            description=f"Discarded prediction {prediction_id}.",
            resource_id=str(prediction_id),
            status="Success",
            severity="INFO"
        )

        return prediction


# ── Helpers ────────────────────────────────────────────────────────────────

async def _get_prediction_or_404(prediction_id: str) -> PredictionRecord:
    try:
        obj_id = PydanticObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID format.")
    prediction = await PredictionRecord.get(obj_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return prediction


async def _audit_failed(user, request, description: str, severity: str = "WARNING"):
    """Helper to create a failed audit log entry."""
    create_audit_log(
        user=user,
        request=request,
        action="PREDICTION_FAILED",
        module="Predictions",
        description=f"Prediction failed: {description}",
        status="Failed",
        severity=severity
    )
