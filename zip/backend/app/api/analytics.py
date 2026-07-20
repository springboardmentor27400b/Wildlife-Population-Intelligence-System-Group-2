from fastapi import APIRouter, Depends
from app.models.user import User
from app.core.permissions import ADMIN_ONLY

router = APIRouter()

@router.get("/platform")
async def get_platform_analytics(current_user: User = Depends(ADMIN_ONLY)):
    return {"message": "Platform Analytics Data"}
