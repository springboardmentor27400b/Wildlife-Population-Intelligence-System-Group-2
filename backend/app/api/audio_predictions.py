from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from app.api.auth import get_current_user
from app.models.user import User
from app.models.audio_prediction import AudioPredictionRecord
from app.services.audio_prediction_service import AudioPredictionService

from bson.errors import InvalidId

router = APIRouter()


class LinkObservationRequest(BaseModel):
    observation_id: str = Field(..., description="The ID of the existing ObservationRecord to link.")


@router.post("/species", status_code=status.HTTP_200_OK)
async def predict_audio_species_endpoint(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a wildlife audio file (.wav, .mp3, .flac) and run bioacoustic classification.
    """
    prediction_record = await AudioPredictionService.process_and_predict(
        file=file,
        current_user=current_user,
        request=request
    )
    
    return prediction_record


@router.get("/")
async def get_audio_predictions_history(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = Query(
        "created_at",
        pattern="^(created_at|confidence_score|prediction_time|species_name|prediction_timestamp)$"
    ),
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
):
    """
    Fetch audio prediction history records with search, filtering, and sorting.
    """
    from app.database.db import supabase

    # Build Supabase query
    query = supabase.table("audio_prediction_records").select("*", count="exact")
    
    if hasattr(sort_by, "default"):
        sort_by = sort_by.default
    if hasattr(sort_order, "default"):
        sort_order = sort_order.default
    
    if status:
        query = query.eq("status", status)

    if search:
        search_term = f"%{search}%"
        # Supabase OR syntax: or=(col1.ilike.val,col2.ilike.val)
        query = query.or_(
            f"species_name.ilike.{search_term},"
            f"file_name.ilike.{search_term},"
            f"user_name.ilike.{search_term}"
        )

    # First get count
    count_res = query.limit(0).execute()
    total = count_res.count if count_res.count is not None else 0

    # Then get data
    data_query = supabase.table("audio_prediction_records").select("*")
    if status:
        data_query = data_query.eq("status", status)
    if search:
        data_query = data_query.or_(
            f"species_name.ilike.{search_term},"
            f"file_name.ilike.{search_term},"
            f"user_name.ilike.{search_term}"
        )
        
    skip = (page - 1) * limit
    
    # Supabase sorting
    is_desc = sort_order == "desc"
    data_query = data_query.order(sort_by, desc=is_desc)
    
    # Pagination
    data_query = data_query.range(skip, skip + limit - 1)
    
    res = data_query.execute()
    
    predictions = [AudioPredictionRecord(**d) for d in res.data]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "predictions": predictions
    }


@router.post("/{prediction_id}/link-observation")
async def link_observation_endpoint(
    prediction_id: str,
    payload: LinkObservationRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Link an AI bioacoustic prediction to an *existing* ObservationRecord.
    """
    return await AudioPredictionService.link_to_observation(
        prediction_id=prediction_id,
        observation_id=payload.observation_id,
        current_user=current_user,
        request=request
    )
