from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.conservation_service import get_recommendations, generate_recommendations
from app.schemas.conservation import ConservationGenerateRequest

router = APIRouter(prefix="/conservation", tags=["conservation"])

@router.get("")
@router.get("/")
@router.get("/recommendations")
def get_recs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_recommendations(db)

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recs = get_recommendations(db)
    critical_count = sum(1 for r in recs if r["priority"] == "Critical")
    high_count = sum(1 for r in recs if r["priority"] == "High")
    medium_count = sum(1 for r in recs if r["priority"] == "Medium")
    low_count = sum(1 for r in recs if r["priority"] == "Low")
    return {
        "total_recommendations": len(recs),
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "recommendations": recs
    }

@router.post("/generate")
def generate_recs(req: ConservationGenerateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return generate_recommendations(db, req.species, req.habitat, req.trigger)
