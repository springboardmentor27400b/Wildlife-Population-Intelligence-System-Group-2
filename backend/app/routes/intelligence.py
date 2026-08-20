from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.services.population_service import get_population_summary, get_species_population, get_population_trends
from app.services.habitat_service import get_habitat_summary, get_habitat_map
from app.services.conservation_service import get_recommendations
from app.services.ecosystem_service import get_ecosystem_summary
import io
import csv

from app.services.intelligence_engine import recalculate_all_intelligence
from app.models.image_detection import ImageDetection
from app.models.audio_detection import AudioDetection
from app.models.observation import Observation
from app.models.survey import Survey
from app.models.species import Species

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

@router.post("/recalculate")
def trigger_recalculate(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = recalculate_all_intelligence(db)
    return res

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    # Run dynamic recalculation pipeline to ensure latest detection sync
    recalculate_all_intelligence(db)

    pop = get_population_summary(db)
    hab = get_habitat_summary(db)
    recs = get_recommendations(db)
    eco = get_ecosystem_summary(db)
    
    habitats_list = hab.get("habitats", [])
    healthy = sum(1 for h in habitats_list if h.get("risk_level") in ["Low", "Excellent", "Good"])
    at_risk = sum(1 for h in habitats_list if h.get("risk_level") in ["Medium", "Moderate", "High"])
    critical = sum(1 for h in habitats_list if h.get("risk_level") in ["Critical", "Poor"])
    
    total_species = db.query(Species).count() or len(pop.get("stats", []))
    image_dets_count = db.query(ImageDetection).count()
    audio_dets_count = db.query(AudioDetection).count()
    obs_count = db.query(Observation).count()
    surveys_count = db.query(Survey).count()
    
    recent_image_dets = db.query(ImageDetection).order_by(ImageDetection.id.desc()).limit(5).all()
    recent_audio_dets = db.query(AudioDetection).order_by(AudioDetection.id.desc()).limit(5).all()
    recent_obs_joined = db.query(Observation, Species).join(Species, Observation.species_id == Species.id).order_by(Observation.id.desc()).limit(5).all()
    
    all_species = db.query(Species).all()
    protected_count = sum(1 for s in all_species if getattr(s, 'is_protected', False) or (s.iucn_status and s.iucn_status in ['Endangered', 'Critically Endangered', 'Vulnerable']))
    
    return {
        "total_species": total_species,
        "protected_species": protected_count or int(total_species * 0.4),
        "habitats_count": len(habitats_list),
        "population_records_count": len(pop.get("stats", [])),
        "total_population": pop.get("total_population", 0),
        "conservation_projects_count": len(recs),
        "healthy_habitats": healthy,
        "at_risk_habitats": at_risk,
        "critical_habitats": critical,
        "image_detections_count": image_dets_count,
        "audio_detections_count": audio_dets_count,
        "total_ai_detections": image_dets_count + audio_dets_count,
        "today_observations": obs_count,
        "surveys_count": surveys_count,
        "average_biodiversity": eco.get("biodiversity_score", 0.0),
        "average_habitat_quality": hab.get("average_quality", 0.0),
        "average_population_growth": pop.get("average_growth_rate", 0.0),
        "health_score": eco.get("overall_health_score", 0.0),
        "ecosystem_grade": eco.get("ecosystem_grade", "B"),
        "population": pop,
        "habitat": hab,
        "conservation": recs,
        "ecosystem": eco,
        "population_trend": get_population_trends(db),
        "species_distribution": pop.get("stats", []),
        "habitat_map": get_habitat_map(db),
        "recent_image_detections": [
            {"id": d.id, "species": d.species, "confidence": d.confidence, "date": d.detection_date or str(d.created_at)[:10]} for d in recent_image_dets
        ],
        "recent_audio_detections": [
            {"id": a.id, "species": a.species, "confidence": a.confidence, "date": a.detection_date or str(a.created_at)[:10]} for a in recent_audio_dets
        ],
        "recent_observations": [
            {"id": o.id, "species": sp.common_name, "count": o.count, "date": str(o.observation_date)} for o, sp in recent_obs_joined
        ]
    }

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    species_pop = get_species_population(db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Species Name", "Scientific Name", "Protected Area", "Current Population", "Previous Population", "Growth Rate", "Confidence Score", "Status"])
    
    for sp in species_pop:
        writer.writerow([
            sp.get("species"),
            sp.get("scientific_name"),
            sp.get("protected_area"),
            sp.get("current_population"),
            sp.get("previous_population"),
            sp.get("growth_rate"),
            sp.get("confidence_score"),
            sp.get("population_status")
        ])
        
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=wildlife_intelligence_data.csv"})

@router.get("/export/pdf")
def export_pdf(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    try:
        from reportlab.pdfgen import canvas
    except ImportError:
        # Simple plain text stream if reportlab unavailable
        return StreamingResponse(iter(["Wildlife Population & Ecosystem Intelligence Summary Report\n"]), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=wildlife_intelligence_report.pdf"})
        
    output = io.BytesIO()
    p = canvas.Canvas(output)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 800, "Wildlife Population & Ecosystem Intelligence Report")
    p.setFont("Helvetica", 12)
    p.drawString(100, 770, "Generated from SQLite Conservation Database")
    
    species_pop = get_species_population(db)
    y = 730
    for sp in species_pop[:15]:
        p.drawString(100, y, f"{sp.get('species')} ({sp.get('scientific_name')}): Pop {sp.get('current_population')} | Status: {sp.get('population_status')}")
        y -= 25
        if y < 50:
            p.showPage()
            y = 800

    p.save()
    output.seek(0)
    return StreamingResponse(output, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=wildlife_intelligence_report.pdf"})
