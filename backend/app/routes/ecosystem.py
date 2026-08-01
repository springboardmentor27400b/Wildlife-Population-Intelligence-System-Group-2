from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.ecosystem_service import get_ecosystem_summary, get_ecosystem_health, get_ecosystem_trends

router = APIRouter(prefix="/ecosystem", tags=["ecosystem"])

@router.get("")
@router.get("/")
def get_ecosystem_list(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_ecosystem_trends(db)

@router.get("/dashboard")
@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_ecosystem_summary(db)

@router.get("/health")
def get_health(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_ecosystem_health(db)

@router.get("/trends")
def get_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_ecosystem_trends(db)

@router.post("/update")
def update_ecosystem(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.services.intelligence_engine import recalculate_all_intelligence
    recalculate_all_intelligence(db)
    return get_ecosystem_summary(db)
