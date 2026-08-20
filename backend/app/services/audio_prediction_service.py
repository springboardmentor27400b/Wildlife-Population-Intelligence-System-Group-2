import os
import uuid
import time
import json
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, Request
from app.models.user import User
from app.ml.audio_predictor import predict_audio_species
from app.utils.audit import create_audit_log
from app.database.db import supabase

AUDIO_UPLOAD_DIR = "uploads/audio_predictions"
os.makedirs(AUDIO_UPLOAD_DIR, exist_ok=True)

SUPPORTED_AUDIO_EXTENSIONS = {"wav", "mp3", "flac"}


class AudioPredictionService:

    @staticmethod
    async def process_and_predict(
        file: UploadFile,
        current_user: User,
        request: Request
    ) -> dict:
        """
        Full pipeline:
          1. Validate file extension and size
          2. Save to disk
          3. Run ML inference (audio_predictor)
          4. Persist AudioPredictionRecord to Supabase
          5. Fire notifications
        """
        # ── 1. Extension check ────────────────────────────────────────────
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        if ext not in SUPPORTED_AUDIO_EXTENSIONS:
            await _audit_failed(current_user, request,
                                f"Unsupported audio file extension .{ext}")
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Please upload a {', '.join(f'.{e}' for e in SUPPORTED_AUDIO_EXTENSIONS)} audio file."
            )

        # ── 2. Read content + size check ─────────────────────────────────
        max_size = 50 * 1024 * 1024  # 50 MB for audio
        content = await file.read()
        file_size = len(content)

        if file_size > max_size:
            await _audit_failed(current_user, request,
                                "File size exceeds 50 MB limit")
            raise HTTPException(
                status_code=400,
                detail="File size exceeds the 50 MB limit."
            )

        # ── 3. Save to disk ───────────────────────────────────────────────
        unique_filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(AUDIO_UPLOAD_DIR, unique_filename)
        file_url = f"/uploads/audio_predictions/{unique_filename}"

        try:
            with open(file_path, "wb") as buffer:
                buffer.write(content)

            # ── 4. Run ML inference ───────────────────────────────────────
            start_time = time.time()
            try:
                result = predict_audio_species(file_path)
            except Exception as e:
                await _audit_failed(current_user, request,
                                    f"Audio model prediction error: {str(e)}", severity="ERROR")
                raise HTTPException(
                    status_code=500,
                    detail=str(e)
                )
            end_time = time.time()
            prediction_time = round(end_time - start_time, 3)

            if "error" in result:
                await _audit_failed(current_user, request,
                                    f"Audio Prediction returned error: {result['error']}", severity="ERROR")
                raise HTTPException(status_code=400, detail=result["error"])

            # ── 5. Resolve prediction_timestamp from result ───────────────
            prediction_ts = None
            raw_ts = result.get("prediction_timestamp")
            if raw_ts:
                try:
                    prediction_ts = datetime.fromisoformat(raw_ts).isoformat()
                except Exception:
                    prediction_ts = datetime.utcnow().isoformat()
            else:
                prediction_ts = datetime.utcnow().isoformat()

            # ── 6. Build and save AudioPredictionRecord ───────────────────
            top_predictions = [
                {"species": p["species"], "confidence": p["confidence"]}
                for p in result.get("top_predictions", [])
            ]
            top_3 = top_predictions[:3]

            record_id = str(uuid.uuid4())
            prediction_record = {
                "id": record_id,
                "species_name": result["predicted_category"],
                "confidence_score": result["confidence"],
                "prediction_time": prediction_time,
                "prediction_timestamp": prediction_ts,
                "model_version": "1.0.0 (Audio)",
                "top_3_predictions": top_3,
                "top_predictions": top_predictions,
                "file_name": file.filename,
                "file_url": file_url,
                "duration_seconds": result.get("duration"),
                "sample_rate": result.get("sample_rate"),
                "channels": result.get("channels", 1),
                "audio_quality": result.get("audio_quality"),
                "noise_level_db": result.get("noise_level_db"),
                "status": "Pending",
                "user_id": str(current_user.id),
                "user_name": current_user.full_name,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            db_record = {
                "id": record_id,
                "audio_file_name": file.filename,
                "file_url": file_url,
                "species_name": result["predicted_category"],
                "confidence_score": result["confidence"],
                "model_name": "1.0.0 (Audio)",
                "top_predictions": top_predictions,
                "user_id": str(current_user.id),
                "user_name": current_user.full_name,
                "status": "Pending",
                "created_at": datetime.utcnow().isoformat()
            }

            try:
                supabase.table("audio_prediction_records").insert(db_record).execute()
            except Exception as e:
                import logging
                logging.error(f"Failed to save AudioPredictionRecord to history: {e}")

            # ── 7. Audit success ──────────────────────────────────────────
            try:
                create_audit_log(
                    user=current_user,
                    request=request,
                    action="AUDIO_PREDICTION_EXECUTED",
                    module="Predictions",
                    description=f"Bioacoustic prediction executed successfully for {file.filename}. "
                                f"Species: {result['predicted_category']} ({result['confidence']}%).",
                    resource_id=prediction_record.get('id'),
                    status="Success",
                    severity="INFO"
                )
            except Exception as e:
                import logging
                logging.error(f"Failed to create audit log for audio prediction: {e}")

            return prediction_record

        except Exception as e:
            # Cleanup on failure
            if os.path.exists(file_path):
                os.remove(file_path)
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=str(e)
            )


    @staticmethod
    async def link_to_observation(
        prediction_id: str,
        observation_id: str,
        current_user: User,
        request: Request
    ) -> dict:
        """
        Link an Audio Prediction to an *existing* ObservationRecord.
        """
        prediction = await _get_prediction_or_404(prediction_id)

        if prediction.get("status") == "Saved":
            raise HTTPException(
                status_code=400,
                detail="Prediction is already linked to an observation."
            )

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
        update_obs["notes"] = f"{current_notes}\n[Linked Bioacoustic AI Prediction ID: {prediction_id}, Confidence: {prediction.get('confidence_score')}%]".strip()
            
        supabase.table("observation_records").update(update_obs).eq("id", observation_id).execute()

        # Update prediction → observation
        supabase.table("audio_prediction_records").update({
            "observation_id": observation_id,
            "status": "Saved",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", prediction_id).execute()

        create_audit_log(
            user=current_user,
            request=request,
            action="AUDIO_PREDICTION_LINKED",
            module="Predictions",
            description=f"Audio Prediction {prediction_id} linked to existing observation {observation_id}.",
            resource_id=prediction_id,
            status="Success",
            severity="SUCCESS"
        )

        return {
            "message": "Audio Prediction successfully linked to existing observation.",
            "prediction_id": prediction_id,
            "observation_id": observation_id
        }


async def _get_prediction_or_404(prediction_id: str) -> dict:
    try:
        res = supabase.table("audio_prediction_records").select("*").eq("id", prediction_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Audio Prediction record not found.")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail="Invalid prediction ID format.")


async def _audit_failed(user, request, description: str, severity: str = "WARNING"):
    create_audit_log(
        user=user,
        request=request,
        action="AUDIO_PREDICTION_FAILED",
        module="Predictions",
        description=f"Audio Prediction failed: {description}",
        status="Failed",
        severity=severity
    )
