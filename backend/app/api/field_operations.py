from fastapi import APIRouter, Depends
from app.models.user import User
from app.core.permissions import FIELD_OPERATIONS_ACCESS

router = APIRouter()

@router.get("/protected-areas")
async def get_protected_areas(current_user: User = Depends(FIELD_OPERATIONS_ACCESS)):
    return {"message": "Protected areas monitoring data"}

@router.get("/device-status")
async def get_device_status(current_user: User = Depends(FIELD_OPERATIONS_ACCESS)):
    return {"message": "Monitoring devices status"}

@router.get("/patrol-plans")
async def get_patrol_plans(current_user: User = Depends(FIELD_OPERATIONS_ACCESS)):
    return {"message": "Patrol planning data"}

@router.get("/incidents")
async def get_incidents(current_user: User = Depends(FIELD_OPERATIONS_ACCESS)):
    return {"message": "Incident reports"}
