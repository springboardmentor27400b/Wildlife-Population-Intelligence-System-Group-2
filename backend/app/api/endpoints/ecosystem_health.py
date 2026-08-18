from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db, get_mongo_db
from app.api.deps import get_current_user
from app.models.sql import User
from app.services.ecosystem_health_service import EcosystemHealthService

router = APIRouter()

@router.get("/score", response_model=Dict[str, Any])
def get_ecosystem_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    """
    Phase 5 Step 1 Endpoint: Computes independent Ecosystem Health Score using PDF weighted model:
    Overall Score = 0.30(Sd) + 0.25(Ps) + 0.20(Hq) + 0.15(Es) + 0.10(Ec)
    """
    return EcosystemHealthService.calculate_ecosystem_health_score(
        user_id=current_user.id,
        db=db,
        mongo_db=mongo_db
    )
