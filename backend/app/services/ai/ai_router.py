from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, RoleChecker
from app.core.database import get_mongo_db, get_db
from app.services.ai import inference_service, audio_inference_service

router = APIRouter()

class ImageAnalyzeRequest(BaseModel):
    media_id: str


@router.post("/image/analyze", response_model=dict)
def analyze_image(
    payload: ImageAnalyzeRequest,
    current_user = Depends(RoleChecker(["Researcher", "Officer", "ForestDept", "Admin"])),
    mongo_db = Depends(get_mongo_db),
    db: Session = Depends(get_db)
):
    """
    Triggers AI inference for an uploaded image.
    Executes the 4-stage computer vision inference pipeline.
    If an endangered species is detected, automatically creates an active
    endangered_species alert in the database.
    """
    try:
        result = inference_service.run_image_inference_pipeline(
            media_id=payload.media_id,
            mongo_db=mongo_db
        )

        # Check if endangered species was detected and trigger alert in PostgreSQL
        endangered_info = result.get("endangered_species_detection") or {}
        cons_status = result.get("conservation_status") or {}
        detected_species = result.get("detected_species") or cons_status.get("scientific_name") or "Wildlife Species"
        common_name = cons_status.get("common_name") or detected_species
        cat = cons_status.get("iucn_category") or "Endangered"

        is_threatened = (
            endangered_info.get("detected") or
            str(cat).upper() in ["CR", "EN", "VU", "CRITICAL", "ENDANGERED", "VULNERABLE"] or
            any(k in detected_species.lower() for k in ["tiger", "panthera tigris", "panda", "leopard", "elephant", "rhino", "cheetah", "lion"]) or
            any(k in common_name.lower() for k in ["tiger", "panda", "leopard", "elephant", "rhino", "cheetah", "lion"])
        )

        if is_threatened:
            try:
                from app.services.alert_service import trigger_endangered_species_alert
                trigger_endangered_species_alert(
                    db=db,
                    species_name=detected_species,
                    common_name=common_name,
                    iucn_category=cat if cat else "Endangered",
                    confidence=float(result.get("confidence") or 0.95),
                    site_id=result.get("site_id"),
                    device_id=result.get("device_id"),
                    user_id=getattr(current_user, "id", None)
                )
            except Exception as alert_err:
                print(f"Error triggering endangered species alert: {alert_err}")

        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except IOError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(e)}"
        )

class AudioAnalyzeRequest(BaseModel):
    media_id: str
    analysis_type: str = "bird"


@router.post("/audio/analyze", response_model=dict)
def analyze_audio(
    payload: AudioAnalyzeRequest,
    current_user = Depends(RoleChecker(["Researcher", "Officer", "ForestDept", "Admin"])),
    mongo_db = Depends(get_mongo_db),
    db: Session = Depends(get_db)
):
    """
    Triggers bioacoustic analysis for an uploaded audio asset.
    """
    try:
        result = audio_inference_service.run_audio_inference_pipeline(
            media_id=payload.media_id,
            mongo_db=mongo_db,
            analysis_type=payload.analysis_type
        )

        # Check if endangered species was detected in audio and trigger alert
        cons_status = result.get("conservation_status") or {}
        detected_species = result.get("primary_detected_species") or result.get("detected_species") or cons_status.get("scientific_name") or ""
        common_name = result.get("common_name") or cons_status.get("common_name") or detected_species
        cat = cons_status.get("iucn_category") or ""

        if detected_species and (str(cat).upper() in ["CR", "EN", "VU", "CRITICAL", "ENDANGERED", "VULNERABLE"] or
            any(k in detected_species.lower() for k in ["tiger", "panda", "leopard", "elephant", "eagle", "crane"]) or
            any(k in common_name.lower() for k in ["tiger", "panda", "leopard", "elephant", "eagle", "crane"])):
            try:
                from app.services.alert_service import trigger_endangered_species_alert
                trigger_endangered_species_alert(
                    db=db,
                    species_name=detected_species,
                    common_name=common_name,
                    iucn_category=cat if cat else "Endangered",
                    confidence=float(result.get("confidence") or 0.90),
                    site_id=result.get("site_id"),
                    device_id=result.get("device_id"),
                    user_id=getattr(current_user, "id", None)
                )
            except Exception as alert_err:
                print(f"Error triggering audio endangered species alert: {alert_err}")

        return result
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except IOError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(e)}"
        )

@router.get("/results/{result_id}", response_model=dict)
def get_ai_result(
    result_id: str,
    current_user = Depends(get_current_user)
):
    """
    Placeholder endpoint for retrieving historical AI prediction results.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Retrieving AI results by ID is not implemented in this phase."
    )
