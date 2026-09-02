from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.monitoring_site import MonitoringSite
from app.models.observation import Observation
from app.models.species import Species
from app.models.habitat import HabitatAnalysis
from app.models.population import PopulationDensity

router = APIRouter(prefix="/gis", tags=["gis"])

@router.get("/map-data")
def get_gis_map_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sites = db.query(MonitoringSite).all()
    observations = db.query(Observation, Species, MonitoringSite).join(
        Species, Observation.species_id == Species.id
    ).join(
        MonitoringSite, Observation.site_id == MonitoringSite.id
    ).all()
    habitats = db.query(HabitatAnalysis).all()
    pop_densities = db.query(PopulationDensity).all()

    site_points = []
    for s in sites:
        lat = float(s.latitude) if s.latitude is not None else -2.3333
        lng = float(s.longitude) if s.longitude is not None else 34.8333
        site_points.append({
            "id": s.id,
            "type": "site",
            "name": s.site_name,
            "lat": lat,
            "lng": lng,
            "habitat": s.habitat or "Protected Area",
            "country": s.country or "East Africa",
            "risk_level": "Monitored",
            "marker_color": "#059669"
        })

    obs_points = []
    for obs, species, site in observations:
        risk = (
            "Critical" if (species.iucn_status and "Critically" in species.iucn_status)
            else "High Risk" if (species.iucn_status and "Endangered" in species.iucn_status)
            else "Medium Risk" if (species.iucn_status and "Vulnerable" in species.iucn_status)
            else "Healthy"
        )
        color = (
            "#dc2626" if risk == "Critical"
            else "#ea580c" if risk == "High Risk"
            else "#d97706" if risk == "Medium Risk"
            else "#059669"
        )
        base_lat = float(site.latitude) if site.latitude is not None else -2.3333
        base_lng = float(site.longitude) if site.longitude is not None else 34.8333
        
        # Deterministic micro-offset so overlapping observations at the same station are individually selectable
        offset_lat = ((obs.id * 17) % 31 - 15) * 0.0012
        offset_lng = ((obs.id * 23) % 31 - 15) * 0.0012

        obs_points.append({
            "id": obs.id,
            "type": "observation",
            "species": species.common_name,
            "scientific_name": species.scientific_name or "Unknown",
            "category": species.category or "Fauna",
            "iucn_status": species.iucn_status or "Observed",
            "site": site.site_name,
            "site_id": site.id,
            "lat": round(base_lat + offset_lat, 5),
            "lng": round(base_lng + offset_lng, 5),
            "count": obs.count,
            "confidence": 0.95,
            "risk_level": risk,
            "marker_color": color,
            "observation_date": str(obs.observation_date),
            "habitat": site.habitat or "Natural Habitat"
        })

    habitat_zones = []
    for h in habitats:
        r = h.risk_level or ("Low" if (h.quality_score or 75) >= 80 else "Medium" if (h.quality_score or 75) >= 60 else "High" if (h.quality_score or 75) >= 40 else "Critical")
        color = (
            "#dc2626" if r == "Critical"
            else "#ea580c" if r == "High"
            else "#d97706" if r in ["Medium", "Moderate"]
            else "#059669"
        )
        lat = float(h.latitude) if h.latitude is not None else -2.3333
        lng = float(h.longitude) if h.longitude is not None else 34.8333
        habitat_zones.append({
            "id": h.id,
            "name": h.habitat_name,
            "region": h.region or h.location or "Sanctuary",
            "lat": lat,
            "lng": lng,
            "quality_score": float(h.quality_score or h.suitability_score or 75.0),
            "suitability_score": float(h.suitability_score or h.quality_score or 75.0),
            "water_availability": float(h.water_availability if h.water_availability is not None else 70.0),
            "vegetation_density": float(h.vegetation_density if h.vegetation_density is not None else 75.0),
            "human_disturbance": float(h.human_disturbance if h.human_disturbance is not None else 20.0),
            "risk_level": r,
            "marker_color": color,
            "species_count": int(h.species_count or 8),
            "area_km2": float(h.area_km2 or 300.0)
        })

    pop_hotspots = []
    for p in pop_densities:
        lat = float(p.latitude) if p.latitude is not None else -2.3333
        lng = float(p.longitude) if p.longitude is not None else 34.8333
        pop_hotspots.append({
            "id": p.id,
            "habitat_name": p.habitat_name,
            "species": p.species,
            "population_count": p.population_count or 50,
            "density": float(p.density or 0.5),
            "area_km2": float(p.area_km2 or 300.0),
            "lat": lat,
            "lng": lng,
            "marker_color": "#2563eb"
        })

    # Compute bounding box and center from real available coordinates
    all_lats = [p["lat"] for p in site_points + obs_points + habitat_zones if p.get("lat") is not None]
    all_lngs = [p["lng"] for p in site_points + obs_points + habitat_zones if p.get("lng") is not None]

    if all_lats and all_lngs:
        center = [round(sum(all_lats) / len(all_lats), 4), round(sum(all_lngs) / len(all_lngs), 4)]
        bounds = [[min(all_lats), min(all_lngs)], [max(all_lats), max(all_lngs)]]
    else:
        center = [-2.3333, 34.8333]
        bounds = None

    return {
        "sites": site_points,
        "observations": obs_points,
        "habitats": habitat_zones,
        "hotspots": pop_hotspots,
        "total_sites": len(site_points),
        "total_observations": len(obs_points),
        "total_habitats": len(habitat_zones),
        "total_hotspots": len(pop_hotspots),
        "center": center,
        "bounds": bounds
    }
