from sqlalchemy.orm import Session
from app.models.habitat import HabitatAnalysis, HabitatRisk, MigrationCorridor

def get_habitat_summary(db: Session) -> dict:
    habitats = db.query(HabitatAnalysis).all()
    if not habitats:
        return {
            "total_habitats": 0,
            "healthy_count": 0,
            "at_risk_count": 0,
            "critical_count": 0,
            "average_quality": 0.0,
            "habitats": [],
            "analyses": []
        }
    
    formatted = []
    healthy = 0
    at_risk = 0
    critical = 0
    quality_sum = 0.0

    for h in habitats:
        q = h.quality_score or h.habitat_quality or h.suitability_score or 75.0
        r = h.risk_level or ("Low" if q >= 80 else "Medium" if q >= 60 else "High" if q >= 40 else "Critical")
        if r == "Low":
            healthy += 1
        elif r in ["High", "Medium"]:
            at_risk += 1
        elif r == "Critical":
            critical += 1

        quality_sum += q

        item = {
            "id": h.id,
            "habitat_name": h.habitat_name,
            "region": h.region or h.location or "Sanctuary Sector",
            "location": h.location or h.region or "Reserve Zone",
            "quality_score": q,
            "habitat_quality": q,
            "suitability_score": h.suitability_score or q,
            "water_availability": h.water_availability if h.water_availability is not None else 75.0,
            "vegetation_density": h.vegetation_density if h.vegetation_density is not None else 70.0,
            "temperature": h.temperature or h.temperature_celsius or 26.0,
            "temperature_celsius": h.temperature_celsius or h.temperature or 26.0,
            "humidity": h.humidity if h.humidity is not None else 65.0,
            "food_availability": h.food_availability if h.food_availability is not None else 80.0,
            "human_disturbance": h.human_disturbance if h.human_disturbance is not None else 25.0,
            "pollution_index": h.pollution_index if h.pollution_index is not None else 20.0,
            "fire_risk": h.fire_risk if h.fire_risk is not None else 15.0,
            "risk_level": r,
            "species_count": h.species_count or 10,
            "latitude": h.latitude or -2.33,
            "longitude": h.longitude or 34.83,
            "area_km2": h.area_km2 or 300.0
        }
        formatted.append(item)

    avg_q = round(quality_sum / len(habitats), 1) if habitats else 0.0

    return {
        "total_habitats": len(habitats),
        "healthy_count": healthy,
        "at_risk_count": at_risk,
        "critical_count": critical,
        "average_quality": avg_q,
        "habitats": formatted,
        "analyses": formatted
    }

def get_habitat_risk(db: Session) -> list[dict]:
    risks = db.query(HabitatRisk).all()
    if risks:
        return [
            {
                "id": r.id,
                "habitat_name": r.habitat_name,
                "risk_category": r.risk_category,
                "risk_score": r.risk_score,
                "primary_threat": r.primary_threat,
                "affected_species": r.affected_species,
                "description": r.description
            }
            for r in risks
        ]
    
    # Fallback from HabitatAnalysis
    summary = get_habitat_summary(db)
    result = []
    for h in summary["habitats"]:
        if h["risk_level"] in ["Medium", "High", "Critical"]:
            result.append({
                "id": h["id"],
                "habitat_name": h["habitat_name"],
                "risk_category": "Environmental Vulnerability",
                "risk_score": round(100.0 - h["quality_score"], 1),
                "primary_threat": "Human Disturbance & Climate Shift" if h["human_disturbance"] > 50 else "Habitat Encroachment",
                "affected_species": f"{h['species_count']} Monitored Species",
                "description": f"{h['habitat_name']} shows {h['risk_level']} risk level with quality score {h['quality_score']}."
            })
    return result

def get_habitat_map(db: Session) -> list[dict]:
    summary = get_habitat_summary(db)
    map_data = []
    for h in summary["habitats"]:
        map_data.append({
            "id": h["id"],
            "habitat_name": h["habitat_name"],
            "species": f"{h['species_count']} Monitored Species",
            "population": h["species_count"] * 12,
            "health_score": h["quality_score"],
            "risk_level": h["risk_level"],
            "latitude": h["latitude"],
            "longitude": h["longitude"],
            "quality_score": h["quality_score"],
            "water_availability": h["water_availability"],
            "vegetation_density": h["vegetation_density"]
        })
    return map_data
