import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from app.api.auth import get_current_user
from app.models.user import User
from app.models.audio_prediction import AudioPredictionRecord
from app.services.audio_prediction_service import AudioPredictionService
from beanie import PydanticObjectId
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
    
    return {
        "predicted_species": prediction_record.species_name,
        "confidence": prediction_record.confidence_score,
        "top_predictions": [
            {
                "species": tp.species,
                "confidence": tp.confidence
            }
            for tp in prediction_record.top_predictions
        ]
    }


@router.get("/")
async def get_audio_predictions_history(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = Query(
        "created_at",
        pattern="^(created_at|confidence_score|prediction_time|species_name|prediction_timestamp)$"
    ),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$")
):
    """
    Fetch audio prediction history records with search, filtering, and sorting.
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

    query = {}
    if conditions:
        query = conditions[0] if len(conditions) == 1 else {"$and": conditions}

    total = await AudioPredictionRecord.find(query).count()
    skip = (page - 1) * limit

    sort_field = sort_by if sort_order == "asc" else f"-{sort_by}"
    predictions = (
        await AudioPredictionRecord.find(query)
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
