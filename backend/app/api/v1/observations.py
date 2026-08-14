import uuid
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.observation import (
    ObservationResponse,
    ObservationCreate,
    ObservationUpdate
)
from app.schemas.common import PaginatedResult
from app.services.observation_service import observation_service
from app.models.user import User
from app.auth.guards import PermissionGuard
from app.auth.permissions import (
    PERM_OBSERVATION_CREATE,
    PERM_OBSERVATION_UPDATE,
    PERM_OBSERVATION_DELETE
)
from app.utils.pagination import paginate

router = APIRouter()

@router.get("", response_model=PaginatedResult[ObservationResponse])
def list_observations(
    site_id: Optional[uuid.UUID] = Query(None, description="Filter by site"),
    species: Optional[str] = Query(None, description="Filter by species"),
    start_date: Optional[datetime] = Query(None, description="Start observed date"),
    end_date: Optional[datetime] = Query(None, description="End observed date"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and list wildlife observations with filtering and pagination.
    """
    skip = (page - 1) * page_size
    items, total = observation_service.search_observations(
        db, site_id=site_id, species=species, start_date=start_date, end_date=end_date, skip=skip, limit=page_size
    )
    return paginate(items, total, page, page_size)

@router.get("/{observation_id}", response_model=ObservationResponse)
def get_observation(
    observation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed sighting log properties including media assets.
    """
    obs = observation_service.get_observation(db, observation_id)
    
    # Dynamically resolve and attach species profile for each analysis record
    from app.models.species_profile import SpeciesProfile
    for analysis in obs.ai_analyses:
        primary_species = None
        if analysis.image_json and analysis.image_json.get("detections"):
            primary_species = analysis.image_json["detections"][0]["species"]
        elif analysis.audio_json and analysis.audio_json.get("top_prediction"):
            primary_species = analysis.audio_json["top_prediction"]["common_name"]
            
        if primary_species:
            clean_lookup = primary_species.replace(" ", "_").strip()
            profile = db.query(SpeciesProfile).filter(
                (SpeciesProfile.scientific_name.ilike(f"%{clean_lookup}%")) |
                (SpeciesProfile.common_name.ilike(f"%{primary_species}%"))
            ).first()
            analysis.species_profile = profile
        else:
            analysis.species_profile = None
            
    return obs

@router.post("", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def create_observation(
    observation_in: ObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_OBSERVATION_CREATE))
):
    """
    Create a new wildlife observation log (requires permissions).
    """
    return observation_service.create_observation(
        db,
        species=observation_in.species,
        count=observation_in.count,
        observed_at=observation_in.observed_at,
        latitude=observation_in.latitude,
        longitude=observation_in.longitude,
        notes=observation_in.notes,
        site_id=observation_in.site_id,
        reporter_id=current_user.id
    )

@router.put("/{observation_id}", response_model=ObservationResponse)
def update_observation(
    observation_id: uuid.UUID,
    observation_in: ObservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_OBSERVATION_UPDATE))
):
    """
    Update sighting log properties (requires permissions).
    """
    return observation_service.update_observation(
        db,
        observation_id=observation_id,
        species=observation_in.species,
        count=observation_in.count,
        observed_at=observation_in.observed_at,
        latitude=observation_in.latitude,
        longitude=observation_in.longitude,
        notes=observation_in.notes,
        site_id=observation_in.site_id
    )

@router.delete("/{observation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_observation(
    observation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_OBSERVATION_DELETE))
):
    """
    Delete observation log (requires permissions).
    """
    observation_service.delete_observation(db, observation_id)
    return None

@router.post("/{observation_id}/analyze", response_model=dict)
def analyze_observation(
    observation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Triggers manual AI analysis for the observation. Runs YOLOv8 for images,
    EfficientNet-B0 for audio, or both, saving outputs to AIAnalysis table.
    """
    from fastapi import HTTPException
    from app.models.ai_analysis import AIAnalysis
    from app.core.logging_config import logger
    
    # 1. Fetch observation
    observation = observation_service.get_observation(db, observation_id)
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
        
    # Find media files
    image_media = next((m for m in observation.media if m.file_type == "image"), None)
    audio_media = next((m for m in observation.media if m.file_type == "audio"), None)
    
    if not image_media and not audio_media:
        raise HTTPException(
            status_code=400,
            detail="No analyzeable media files (image or audio) found in this observation."
        )
        
    # Create or fetch AIAnalysis record
    analysis = db.query(AIAnalysis).filter(AIAnalysis.observation_id == observation_id).first()
    if not analysis:
        analysis = AIAnalysis(
            observation_id=observation_id,
            status="Running",
            image_completed=False,
            audio_completed=False
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
    else:
        analysis.status = "Running"
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

    image_results = None
    audio_results = None
    
    try:
        # Run Image Detection
        if image_media:
            try:
                from app.ai.image.service import image_ai_service
                image_results = image_ai_service.analyze_image(db, observation, image_media)
                analysis.image_json = image_results
                analysis.image_completed = True
            except Exception as e:
                logger.error(f"Image analysis failed: {e}")
                image_results = {
                    "success": False,
                    "module": "image",
                    "message": "Inference failed.",
                    "error": str(e)
                }
                analysis.image_json = image_results
                analysis.image_completed = False
                
        # Run Audio Classification
        if audio_media:
            try:
                from app.ai.audio.service import audio_ai_service
                audio_results = audio_ai_service.analyze_audio(db, observation, audio_media)
                analysis.audio_json = audio_results
                analysis.audio_completed = True
            except Exception as e:
                logger.error(f"Audio analysis failed: {e}")
                audio_results = {
                    "success": False,
                    "module": "audio",
                    "message": "Inference failed.",
                    "error": str(e)
                }
                analysis.audio_json = audio_results
                analysis.audio_completed = False
                
        # Set overall status
        image_success = image_results.get("success", False) if image_results else True
        audio_success = audio_results.get("success", False) if audio_results else True
        
        if (image_media and not image_success) or (audio_media and not audio_success):
            analysis.status = "Failed"
        else:
            analysis.status = "Completed"
            
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
    except Exception as overall_e:
        analysis.status = "Failed"
        db.add(analysis)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Analysis pipeline execution failed: {overall_e}"
        )
        
    return {
        "success": True,
        "observation_id": str(observation_id),
        "status": analysis.status,
        "analysis_completed": analysis.status == "Completed",
        "image": analysis.image_json if analysis.image_json else None,
        "audio": analysis.audio_json if analysis.audio_json else None
    }

@router.get("/{observation_id}/analysis")
def get_latest_observation_analysis(
    observation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the latest AI analysis details for a specific observation.
    """
    from app.models.ai_analysis import AIAnalysis
    analysis = db.query(AIAnalysis).filter(
        AIAnalysis.observation_id == observation_id
    ).order_by(AIAnalysis.created_at.desc()).first()
    
    if not analysis:
        return {
            "success": False,
            "status": "Not Started",
            "message": "No AI analysis runs found for this observation."
        }
        
    return {
        "success": True,
        "observation_id": str(observation_id),
        "status": analysis.status,
        "analysis_completed": analysis.status == "Completed",
        "image": analysis.image_json if analysis.image_json else None,
        "audio": analysis.audio_json if analysis.audio_json else None,
        "created_at": analysis.created_at
    }

