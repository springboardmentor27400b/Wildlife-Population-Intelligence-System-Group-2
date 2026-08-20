from sqlalchemy.orm import Session
from app.models.conservation import ConservationRecommendation

def get_recommendations(db: Session) -> list[dict]:
    recs = db.query(ConservationRecommendation).all()
    if not recs:
        return []
    
    results = []
    for r in recs:
        results.append({
            "id": r.id,
            "species": r.species,
            "habitat": r.habitat,
            "category": r.category,
            "title": r.title,
            "threat_level": r.threat_level or r.priority,
            "main_threat": r.main_threat or r.reason,
            "recommended_action": r.recommended_action or r.recommendation,
            "recommendation": r.recommendation or r.recommended_action,
            "reason": r.reason or r.main_threat,
            "expected_impact": r.expected_impact or "High Positive Impact",
            "priority": r.priority,
            "estimated_cost": r.estimated_cost or 50000.0,
            "completion_status": r.completion_status or "In Progress",
            "assigned_team": r.assigned_team or "Conservation Taskforce",
            "deadline": r.deadline or "2026-12-31",
            "is_active": r.is_active
        })
    
    priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    return sorted(results, key=lambda x: priority_order.get(x["priority"], 4))

def generate_recommendations(db: Session, species: str | None, habitat: str | None, trigger: str | None) -> list[dict]:
    query = db.query(ConservationRecommendation)
    if species:
        query = query.filter(ConservationRecommendation.species.ilike(f"%{species}%"))
    if habitat:
        query = query.filter(ConservationRecommendation.habitat.ilike(f"%{habitat}%"))
    
    results = query.all()
    if not results:
        # Create new recommendation on demand
        new_rec = ConservationRecommendation(
            species=species or "Target Wildlife",
            habitat=habitat or "Protected Reserve",
            category="Custom Intervention",
            title=f"Targeted Intervention for {species or 'Wildlife'}",
            threat_level="High",
            main_threat=trigger or "Environmental Stressors",
            recommended_action=f"Initiate enhanced monitoring for {species or 'wildlife'} in {habitat or 'reserve'}.",
            recommendation=f"Initiate enhanced monitoring for {species or 'wildlife'} in {habitat or 'reserve'}.",
            reason=f"Triggered by system analysis for {trigger or 'conservation priority'}.",
            expected_impact="Protects target species and mitigates local threats.",
            priority="High",
            estimated_cost=75000.0,
            completion_status="In Progress",
            assigned_team="Special Response Team",
            deadline="2026-12-31"
        )
        db.add(new_rec)
        db.commit()
        db.refresh(new_rec)
        results = [new_rec]
        
    return [
        {
            "id": r.id,
            "species": r.species,
            "habitat": r.habitat,
            "category": r.category,
            "title": r.title,
            "threat_level": r.threat_level or r.priority,
            "main_threat": r.main_threat or r.reason,
            "recommended_action": r.recommended_action or r.recommendation,
            "recommendation": r.recommendation or r.recommended_action,
            "reason": r.reason or r.main_threat,
            "expected_impact": r.expected_impact,
            "priority": r.priority,
            "estimated_cost": r.estimated_cost,
            "completion_status": r.completion_status,
            "assigned_team": r.assigned_team,
            "deadline": r.deadline,
            "is_active": r.is_active
        }
        for r in results
    ]
