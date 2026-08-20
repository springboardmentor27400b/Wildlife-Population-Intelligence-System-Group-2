from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Query
from pydantic import BaseModel, Field
from typing import Optional
from app.api.auth import get_current_user
from app.models.user import User
from app.models.unified_prediction import UnifiedPredictionRecord
from app.services.unified_prediction_service import UnifiedPredictionService

router = APIRouter()

class LinkObservationRequest(BaseModel):
    observation_id: str = Field(..., description="The ID of the existing ObservationRecord to link.")

@router.post("/predict", status_code=status.HTTP_200_OK)
async def predict_unified_endpoint(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an image or audio file and run unified AI species classification.
    """
    return await UnifiedPredictionService.predict_unified(
        file=file,
        current_user=current_user,
        request=request
    )

@router.get("/")
async def get_unified_predictions_history(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    source: Optional[str] = None,
    sort_by: Optional[str] = Query(
        "created_at",
        pattern="^(created_at|confidence_score|species_name|prediction_timestamp)$"
    ),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$")
):
    """
    Fetch unified prediction history records with search, filtering, and sorting.
    """
    from app.database.db import supabase

    # Build Supabase query
    query = supabase.table("unified_prediction_records").select("*", count="exact")
    
    if status:
        query = query.eq("status", status)
        
    if source:
        query = query.eq("prediction_source", source)

    if search:
        search_term = f"%{search}%"
        query = query.or_(
            f"species_name.ilike.{search_term},"
            f"scientific_name.ilike.{search_term},"
            f"user_name.ilike.{search_term}"
        )

    # First get count
    count_res = query.limit(0).execute()
    total = count_res.count if count_res.count is not None else 0

    # Then get data
    data_query = supabase.table("unified_prediction_records").select("*")
    if status:
        data_query = data_query.eq("status", status)
    if source:
        data_query = data_query.eq("prediction_source", source)
    if search:
        data_query = data_query.or_(
            f"species_name.ilike.{search_term},"
            f"scientific_name.ilike.{search_term},"
            f"user_name.ilike.{search_term}"
        )
        
    skip = (page - 1) * limit
    
    is_desc = sort_order == "desc"
    data_query = data_query.order(sort_by, desc=is_desc)
    data_query = data_query.range(skip, skip + limit - 1)
    
    res = data_query.execute()
    
    predictions = [UnifiedPredictionRecord(**d) for d in res.data]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "predictions": predictions
    }

@router.get("/{unified_id}")
async def get_unified_prediction(
    unified_id: str,
    current_user: User = Depends(get_current_user)
):
    
    try:
        obj_id = str(unified_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid unified ID format")
    
    record = await get(UnifiedPredictionRecord, obj_id)
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    return record.dict()


@router.post("/{unified_id}/link-observation")
async def link_observation_endpoint(
    unified_id: str,
    payload: LinkObservationRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Link a Unified AI prediction to an *existing* ObservationRecord.
    """
    return await UnifiedPredictionService.link_to_observation(
        unified_id=unified_id,
        observation_id=payload.observation_id,
        current_user=current_user,
        request=request
    )
