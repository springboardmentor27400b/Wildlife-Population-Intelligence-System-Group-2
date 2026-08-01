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


# ── Request / Response Schemas ─────────────────────────────────────────────

class SaveObservationRequest(BaseModel):
    site_id: str
    site_name: str


class LinkObservationRequest(BaseModel):
    observation_id: str = Field(..., description="The ID of the existing ObservationRecord to link.")


# ── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/species", status_code=status.HTTP_200_OK)
async def predict_species_endpoint(
    request: Request,
    file: UploadFile = File(...),
    source: str = Query("Camera Trap", description="Image Source: Camera Trap or Drone"),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a wildlife image and run AI species classification.

    Returns:
      - Predicted species category
      - Confidence score (%)
      - Processing time (seconds)
      - Prediction timestamp (UTC)
      - Image dimensions
      - Top-3 predictions
    """
    return await PredictionService.process_and_predict(
        file=file,
        source=source,
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
    sort_by: Optional[str] = Query(
        "created_at",
        pattern="^(created_at|confidence_score|prediction_time|species_name|prediction_timestamp)$"
    ),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$")
):
    """
    Fetch prediction history records with search, filtering, sorting, and pagination.
    """
    conditions = []

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
        query = conditions[0] if len(conditions) == 1 else {"$and": conditions}

    total = await PredictionRecord.find(query).count()
    skip = (page - 1) * limit

    sort_field = sort_by if sort_order == "asc" else f"-{sort_by}"
    predictions = (
        await PredictionRecord.find(query)
        .sort(sort_field)
        .skip(skip)
        .limit(limit)
        .to_list()
    )

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
    """Retrieve full details of a single prediction record."""
    try:
        obj_id = PydanticObjectId(prediction_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid prediction ID format.")

    prediction = await PredictionRecord.get(obj_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found.")
    return prediction


@router.post("/{prediction_id}/save")
async def save_prediction_endpoint(
    prediction_id: str,
    payload: SaveObservationRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new ObservationRecord from the AI prediction and mark prediction as Saved.
    Use this when no existing observation exists.
    """
    return await PredictionService.save_as_observation(
        prediction_id=prediction_id,
        site_id=payload.site_id,
        site_name=payload.site_name,
        current_user=current_user,
        request=request
    )


@router.post("/{prediction_id}/link-observation")
async def link_observation_endpoint(
    prediction_id: str,
    payload: LinkObservationRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Link an AI prediction to an *existing* ObservationRecord.
    Use this when you want to attach prediction results to a record already in the system.
    Updates both the prediction (status=Saved, observation_id) and the observation
    (prediction_id, prediction_source=AI).
    """
    return await PredictionService.link_to_observation(
        prediction_id=prediction_id,
        observation_id=payload.observation_id,
        current_user=current_user,
        request=request
    )


@router.post("/{prediction_id}/discard")
async def discard_prediction_endpoint(
    prediction_id: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Mark the prediction record as Discarded."""
    return await PredictionService.discard_prediction(
        prediction_id=prediction_id,
        current_user=current_user,
        request=request
    )
