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
from app.ml.predictor import predict_species
from app.utils.audit import create_audit_log
from beanie import PydanticObjectId

PREDICTIONS_UPLOAD_DIR = "uploads/predictions"
os.makedirs(PREDICTIONS_UPLOAD_DIR, exist_ok=True)

class PredictionService:
    @staticmethod
    async def process_and_predict(
        file: UploadFile,
        current_user: User,
        request: Request
    ) -> PredictionRecord:
        # Check file extension
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        if ext not in {"jpg", "jpeg", "png"}:
            create_audit_log(
                user=current_user,
                request=request,
                action="PREDICTION_FAILED",
                module="Predictions",
                description=f"Prediction failed: Unsupported file extension .{ext}",
                status="Failed",
                severity="WARNING"
            )
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload a .jpg, .jpeg, or .png image."
            )

        # Check file size (20 MB max)
        max_size = 20 * 1024 * 1024
        # We can read a small chunk to check, or read the whole file content to verify size
        content = await file.read()
        file_size = len(content)
        await file.seek(0)  # reset file pointer
        
        if file_size > max_size:
            create_audit_log(
                user=current_user,
                request=request,
                action="PREDICTION_FAILED",
                module="Predictions",
                description="Prediction failed: File size exceeds 20MB limit",
                status="Failed",
                severity="WARNING"
            )
            raise HTTPException(
                status_code=400,
                detail="File size exceeds the 20 MB limit."
            )

        # Generate unique filename and path
        unique_filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(PREDICTIONS_UPLOAD_DIR, unique_filename)
        file_url = f"/uploads/predictions/{unique_filename}"

        try:
            # Save file
            with open(file_path, "wb") as buffer:
                buffer.write(content)

            # Validate image and handle corrupted files
            try:
                with Image.open(file_path) as img:
                    img.verify()
            except (UnidentifiedImageError, Exception):
                if os.path.exists(file_path):
                    os.remove(file_path)
                create_audit_log(
                    user=current_user,
                    request=request,
                    action="PREDICTION_FAILED",
                    module="Predictions",
                    description="Prediction failed: Corrupted image file",
                    status="Failed",
                    severity="WARNING"
                )
                raise HTTPException(
                    status_code=400,
                    detail="Invalid or corrupted image file. Please upload a valid image."
                )

            # Run prediction
            start_time = time.time()
            try:
                result = predict_species(file_path)
            except Exception as e:
                create_audit_log(
                    user=current_user,
                    request=request,
                    action="PREDICTION_FAILED",
                    module="Predictions",
                    description=f"Model prediction error: {str(e)}",
                    status="Failed",
                    severity="ERROR"
                )
                raise HTTPException(
                    status_code=500,
                    detail=f"Error running prediction model: {str(e)}"
                )
            
            end_time = time.time()
            prediction_time = round(end_time - start_time, 3)

            if "error" in result:
                create_audit_log(
                    user=current_user,
                    request=request,
                    action="PREDICTION_FAILED",
                    module="Predictions",
                    description=f"Prediction returned error: {result['error']}",
                    status="Failed",
                    severity="ERROR"
                )
                raise HTTPException(status_code=500, detail=result["error"])

            top_3 = [
                TopPrediction(species=p["species"], confidence=p["confidence"])
                for p in result.get("top_3_predictions", [])
            ]

            # Save prediction record to database
            prediction_record = PredictionRecord(
                species_name=result["predicted_category"],
                confidence_score=result["confidence"],
                prediction_time=prediction_time,
                model_version="1.0.0",
                top_3_predictions=top_3,
                file_name=file.filename,
                file_url=file_url,
                status="Pending",
                user_id=str(current_user.id),
                user_name=current_user.full_name
            )
            await prediction_record.insert()

            # Create audit log
            create_audit_log(
                user=current_user,
                request=request,
                action="PREDICTION_EXECUTED",
                module="Predictions",
                description=f"AI prediction executed successfully for {file.filename}.",
                resource_id=str(prediction_record.id),
                status="Success",
                severity="INFO"
            )

            # Trigger Notifications
            # 1. High Confidence Notification
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

            # 2. Rare Species Notification
            rare_species = {"Apex Predators", "Cold-Climate Survivors", "Stealth & Shadows", "Tough Defenders"}
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
            raise HTTPException(status_code=500, detail=f"Failed to process prediction: {str(e)}")

    @staticmethod
    async def save_as_observation(
        prediction_id: str,
        site_id: str,
        site_name: str,
        current_user: User,
        request: Request
    ) -> ObservationRecord:
        try:
            obj_id = PydanticObjectId(prediction_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid prediction ID format")
            
        prediction = await PredictionRecord.get(obj_id)
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction record not found")
        
        if prediction.status == "Saved":
            raise HTTPException(status_code=400, detail="Prediction has already been saved as an observation")

        # Create Observation Record
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

        # Update prediction status
        prediction.status = "Saved"
        prediction.updated_at = datetime.now(timezone.utc)
        await prediction.save()

        # Create Audit Log
        create_audit_log(
            user=current_user,
            request=request,
            action="PREDICTION_SAVED",
            module="Predictions",
            description=f"Saved prediction {prediction_id} as observation {observation.id}",
            resource_id=str(prediction_id),
            status="Success",
            severity="SUCCESS"
        )

        # Create Notification
        saved_notif = Notification(
            title="Prediction Saved Successfully",
            message=f"Prediction of {prediction.species_name} saved as observation.",
            type="prediction",
            priority="Success",
            user_id=str(current_user.id),
            related_resource_id=str(observation.id)
        )
        await saved_notif.insert()

        return observation

    @staticmethod
    async def discard_prediction(
        prediction_id: str,
        current_user: User,
        request: Request
    ) -> PredictionRecord:
        try:
            obj_id = PydanticObjectId(prediction_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid prediction ID format")
            
        prediction = await PredictionRecord.get(obj_id)
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction record not found")

        prediction.status = "Discarded"
        prediction.updated_at = datetime.now(timezone.utc)
        await prediction.save()

        # Create Audit Log
        create_audit_log(
            user=current_user,
            request=request,
            action="PREDICTION_DISCARDED",
            module="Predictions",
            description=f"Discarded prediction {prediction_id}",
            resource_id=str(prediction_id),
            status="Success",
            severity="INFO"
        )

        return prediction
