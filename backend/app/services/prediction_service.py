import os
import uuid
import time
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, Request
from PIL import Image, UnidentifiedImageError
from app.models.user import User
from app.ml.predictor import predict_species, validate_image_bytes, SUPPORTED_EXTENSIONS
from app.utils.audit import create_audit_log
from app.database.db import supabase

PREDICTIONS_UPLOAD_DIR = "uploads/predictions"
os.makedirs(PREDICTIONS_UPLOAD_DIR, exist_ok=True)


class PredictionService:

    @staticmethod
    async def process_and_predict(
        file: UploadFile,
        source: str,
        current_user: User,
        request: Request
    ) -> dict:
        """
        Full pipeline:
          1. Validate file extension and size
          2. Validate image integrity (in-memory, before saving)
          3. Save to disk
          4. Run ML inference
          5. Persist PredictionRecord to Supabase
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
                    prediction_ts = datetime.fromisoformat(raw_ts).isoformat()
                except Exception:
                    prediction_ts = datetime.utcnow().isoformat()
            else:
                prediction_ts = datetime.utcnow().isoformat()

            # ── 7. Build and save PredictionRecord ────────────────────────
            
            top_predictions = [
                {"species": p["species"], "confidence": p["confidence"]}
                for p in result.get("top_predictions", [])
            ]
            top_3 = top_predictions[:3]
            
            detections = [
                {
                    "species": d["species"],
                    "confidence": d["confidence"],
                    "bbox": d["bbox"],
                    "behaviour": d["behaviour"]
                } for d in result.get("detections", [])
            ]

            record_id = str(uuid.uuid4())
            prediction_record = {
                "id": record_id,
                "species_name": result["predicted_category"],
                "confidence_score": result["confidence"],
                "prediction_time": prediction_time,
                "prediction_timestamp": prediction_ts,
                "model_version": "1.0.0",
                "top_3_predictions": top_3,
                "top_predictions": top_predictions,
                "image_file_name": file.filename,
                "image_url": file_url,
                "image_width": result.get("image_width"),
                "image_height": result.get("image_height"),
                "image_source": source,
                "image_quality": result.get("image_quality", "Unknown"),
                "quality_metrics": result.get("quality_metrics", {}),
                "detection_source": result.get("detection_source", "Simulation"),
                "animal_count": result.get("animal_count", 1),
                "detections": detections,
                "status": "Pending",
                "user_id": str(current_user.id),
                "user_name": current_user.full_name,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            db_record = {
                "id": record_id,
                "image_file_name": file.filename,
                "image_url": file_url,
                "species_name": result["predicted_category"],
                "confidence_score": result["confidence"],
                "status": "Pending",
                "user_id": str(current_user.id),
                "user_name": current_user.full_name,
                "created_at": prediction_record["created_at"],
                "updated_at": prediction_record["updated_at"]
            }

            try:
                inserted = supabase.table("prediction_records").insert(db_record).execute()
                if inserted.data:
                    pass # Success
            except Exception as e:
                import logging
                logging.error(f"Failed to save PredictionRecord: {e}")

            # ── 8. Audit success ──────────────────────────────────────────
            create_audit_log(
                user=current_user,
                request=request,
                action="PREDICTION_EXECUTED",
                module="Predictions",
                description=f"AI prediction executed successfully for {file.filename}. "
                            f"Species: {result['predicted_category']} ({result['confidence']}%).",
                resource_id=prediction_record.get('id'),
                status="Success",
                severity="INFO"
            )

            # ── 9. Notifications ──────────────────────────────────────────
            try:
                if result["confidence"] >= 90.0:
                    supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                        "title": "High Confidence Detection",
                        "message": f"High confidence ({result['confidence']}%) AI detection of {result['predicted_category']}.",
                        "type": "prediction",
                        "priority": "Success",
                        "user_id": str(current_user.id),
                        "related_resource_id": prediction_record.get('id'),
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()

                rare_species = {
                    "Apex Predators", "Cold-Climate Survivors",
                    "Stealth & Shadows", "Tough Defenders"
                }
                if result["predicted_category"] in rare_species:
                    supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                        "title": "Rare Species Detection",
                        "message": f"AI model detected potential rare/critical category: {result['predicted_category']}.",
                        "type": "alert",
                        "priority": "High",
                        "user_id": str(current_user.id),
                        "related_resource_id": prediction_record.get('id'),
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()
            except Exception as e:
                import logging
                logging.error(f"Failed to create notifications: {e}")

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
    ) -> dict:
        """Create a new ObservationRecord from a prediction and link them."""
        prediction = await _get_prediction_or_404(prediction_id)

        if prediction.get("status") == "Saved":
            raise HTTPException(
                status_code=400,
                detail="Prediction has already been saved as an observation"
            )

        observation = {
            "id": str(uuid.uuid4()),
            "species_name": prediction.get("species_name"),
            "scientific_name": prediction.get("species_name"),
            "monitoring_site_name": site_name,
            "observed_at": datetime.utcnow().isoformat(),
            "observer_id": str(current_user.id),
            "observer_name": current_user.full_name,
            "count": 1,
            "notes": f"Created automatically from AI Prediction (ID: {prediction_id})",
            "verification_status": "Pending Verification",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        try:
            inserted_obs = supabase.table("observation_records").insert(observation).execute()
            observation = inserted_obs.data[0] if inserted_obs.data else observation
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save observation: {e}")

        # Update prediction record
        supabase.table("prediction_records").update({
            "status": "Saved",
            "observation_id": observation.get("id"),
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", prediction_id).execute()

        create_audit_log(
            user=current_user,
            request=request,
            action="PREDICTION_SAVED",
            module="Predictions",
            description=f"Saved prediction {prediction_id} as new observation {observation.get('id')}.",
            resource_id=str(prediction_id),
            status="Success",
            severity="SUCCESS"
        )

        try:
            supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                "title": "Prediction Saved Successfully",
                "message": f"Prediction of {prediction.get('species_name')} saved as new observation record.",
                "type": "prediction",
                "priority": "Success",
                "user_id": str(current_user.id),
                "related_resource_id": observation.get("id"),
                "is_read": False,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
        except Exception:
            pass

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

        if prediction.get("status") == "Saved":
            raise HTTPException(
                status_code=400,
                detail="Prediction is already linked to an observation."
            )

        # Validate the target observation exists
        try:
            obs = supabase.table("observation_records").select("*").eq("id", observation_id).execute()
            if not obs.data:
                raise HTTPException(status_code=404, detail="Observation record not found.")
            observation = obs.data[0]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid observation ID format or fetch error.")

        # Link prediction → observation
        update_obs = {
            "updated_at": datetime.utcnow().isoformat()
        }
        current_notes = observation.get("notes") or ""
        update_obs["notes"] = f"{current_notes}\n[Linked AI Prediction ID: {prediction_id}, Confidence: {prediction.get('confidence_score')}%]".strip()
            
        supabase.table("observation_records").update(update_obs).eq("id", observation_id).execute()

        # Update prediction → observation
        supabase.table("prediction_records").update({
            "observation_id": observation_id,
            "status": "Saved",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", prediction_id).execute()

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

        try:
            supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                "title": "Prediction Linked to Observation",
                "message": f"AI prediction of {prediction.get('species_name')} linked to observation record.",
                "type": "prediction",
                "priority": "Success",
                "user_id": str(current_user.id),
                "related_resource_id": observation_id,
                "is_read": False,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
        except Exception:
            pass

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
    ) -> dict:
        """Mark a prediction as Discarded."""
        prediction = await _get_prediction_or_404(prediction_id)

        res = supabase.table("prediction_records").update({
            "status": "Discarded",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", prediction_id).execute()

        prediction = res.data[0] if res.data else prediction

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

async def _get_prediction_or_404(prediction_id: str) -> dict:
    try:
        res = supabase.table("prediction_records").select("*").eq("id", prediction_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Prediction record not found.")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail="Invalid prediction ID format.")


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
