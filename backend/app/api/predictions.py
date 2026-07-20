import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from app.api.auth import get_current_user
from app.models.user import User
from app.models.prediction import PredictionRecord
from app.services.prediction_service import PredictionService
from beanie import PydanticObjectId
from bson.errors import InvalidId

router = APIRouter()

class SaveObservationRequest(BaseModel):
    site_id: str
    site_name: str

@router.post("/species", status_code=status.HTTP_200_OK)
async def predict_species_endpoint(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads an image, checks file constraints, runs the AI species prediction,
    creates a prediction history record, and triggers notifications.
    """
    return await PredictionService.process_and_predict(
        file=file,
        current_user=current_user,
        request=request
    )

@router.get("/")
async def get_predictions_history(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    species: Optional[str] = None,
    sort_by: Optional[str] = Query("created_at", pattern="^(created_at|confidence_score|prediction_time|species_name)$"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$")
):
    """
    Fetch prediction history records with support for search, pagination, filtering, and sorting.
    """
    conditions = []
    
    # Filter by user if not Admin? Wait, it's generally good to let users see all predictions or only their own?
    # Usually users see their own or all. Let's make it show all predictions or filter by user. Let's search all.
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        conditions.append({
            "$or": [
                {"species_name": search_regex},
                {"file_name": search_regex},
                {"user_name": search_regex}
            ]
        })
        
    if status:
        conditions.append({"status": status})
        
    if species:
        conditions.append({"species_name": {"$regex": species, "$options": "i"}})
        
    query = {}
    if conditions:
        if len(conditions) == 1:
            query = conditions[0]
        else:
            query = {"$and": conditions}
            
    total = await PredictionRecord.find(query).count()
    skip = (page - 1) * limit
    
    # Handle sorting
    sort_field = sort_by
    if sort_order == "desc":
        sort_field = f"-{sort_field}"
        
    predictions = await PredictionRecord.find(query).sort(sort_field).skip(skip).limit(limit).to_list()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "predictions": predictions
    }

@router.get("/{prediction_id}")
async def get_prediction_detail(
    prediction_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details of a single prediction record.
    """
    try:
        obj_id = PydanticObjectId(prediction_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid prediction ID format")
        
    prediction = await PredictionRecord.get(obj_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction

@router.post("/{prediction_id}/save")
async def save_prediction_endpoint(
    prediction_id: str,
    payload: SaveObservationRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Create an observation record from the AI prediction and update prediction status.
    """
    return await PredictionService.save_as_observation(
        prediction_id=prediction_id,
        site_id=payload.site_id,
        site_name=payload.site_name,
        current_user=current_user,
        request=request
    )

@router.post("/{prediction_id}/discard")
async def discard_prediction_endpoint(
    prediction_id: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Mark the prediction record as discarded.
    """
    return await PredictionService.discard_prediction(
        prediction_id=prediction_id,
        current_user=current_user,
        request=request
    )
