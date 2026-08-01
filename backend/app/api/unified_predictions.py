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
    conditions = []

    if search:
        search_regex = {"$regex": search, "$options": "i"}
        conditions.append({
            "$or": [
                {"species_name": search_regex},
                {"scientific_name": search_regex},
                {"user_name": search_regex}
            ]
        })

    if status:
        conditions.append({"status": status})
        
    if source:
        conditions.append({"prediction_source": source})

    query = {}
    if conditions:
        query = conditions[0] if len(conditions) == 1 else {"$and": conditions}

    total = await UnifiedPredictionRecord.find(query).count()
    skip = (page - 1) * limit

    sort_field = sort_by if sort_order == "asc" else f"-{sort_by}"
    predictions = (
        await UnifiedPredictionRecord.find(query)
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

@router.get("/{unified_id}")
async def get_unified_prediction(
    unified_id: str,
    current_user: User = Depends(get_current_user)
):
    from beanie import PydanticObjectId
    try:
        obj_id = PydanticObjectId(unified_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid unified ID format")
    
    record = await UnifiedPredictionRecord.get(obj_id)
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
