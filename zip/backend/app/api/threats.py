from fastapi import APIRouter, Depends
from app.models.user import User
from app.core.permissions import THREAT_ACCESS

router = APIRouter()

@router.get("")
async def get_threats(current_user: User = Depends(THREAT_ACCESS)):
    return {"message": "Threat monitoring data"}

@router.get("/endangered-species")
async def get_endangered_species(current_user: User = Depends(THREAT_ACCESS)):
    return {"message": "Endangered species alerts"}
