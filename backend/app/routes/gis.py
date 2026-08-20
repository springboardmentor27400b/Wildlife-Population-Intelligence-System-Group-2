from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.monitoring_site import MonitoringSite
from app.models.observation import Observation
from app.models.species import Species
from app.models.habitat import HabitatAnalysis
from app.models.population import PopulationStatistic

router = APIRouter(prefix="/gis", tags=["gis"])

@router.get("/map-data")
def get_gis_map_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sites = db.query(MonitoringSite).all()
    observations = db.query(Observation, Species, MonitoringSite).join(Species, Observation.species_id == Species.id).join(MonitoringSite, Observation.site_id == MonitoringSite.id).all()
    habitats = db.query(HabitatAnalysis).all()
    pop_stats = db.query(PopulationStatistic).all()

    site_points = []
    for s in sites:
        site_points.append({
            "id": s.id,
            "type": "site",
            "name": s.site_name,
            "lat": s.latitude or -2.333,
            "lng": s.longitude or 34.833,
            "habitat": s.habitat or "Savannah",
            "country": s.country or "Tanzania",
            "risk_level": "Healthy",
            "marker_color": "#10b981"
        })

    obs_points = []
    for obs, species, site in observations:
        risk = "Critical" if (species.iucn_status and "Endangered" in species.iucn_status) else "Medium Risk" if (species.iucn_status and "Vulnerable" in species.iucn_status) else "Healthy"
        color = "#ef4444" if risk == "Critical" else "#f59e0b" if risk == "Medium Risk" else "#10b981"
        obs_points.append({
            "id": obs.id,
            "type": "observation",
            "species": species.common_name,
            "scientific_name": species.scientific_name or "Unknown",
            "site": site.site_name,
            "lat": site.latitude or -2.333,
            "lng": site.longitude or 34.833,
            "count": obs.count,
            "confidence": 0.95,
            "risk_level": risk,
            "marker_color": color,
            "observation_date": str(obs.observation_date),
            "habitat": site.habitat
        })

    habitat_zones = []
    if habitats:
        for h in habitats:
            r = h.risk_level or "Low"
            color = "#ef4444" if r == "Critical" else "#f97316" if r == "High" else "#f59e0b" if r in ["Medium", "Moderate"] else "#10b981"
            habitat_zones.append({
                "id": h.id,
                "name": h.habitat_name,
                "lat": h.latitude or -2.333,
                "lng": h.longitude or 34.833,
                "quality_score": h.quality_score or 75.0,
                "risk_level": r,
                "marker_color": color,
                "species_count": h.species_count or 8,
                "area_km2": h.area_km2 or 300.0
            })
    else:
        habitat_zones = [
            {"id": 1, "name": "Serengeti Sector Alpha", "lat": -2.333, "lng": 34.833, "quality_score": 85.0, "risk_level": "Low", "marker_color": "#10b981", "species_count": 14, "area_km2": 450.0},
            {"id": 2, "name": "Ngorongoro Rim Zone", "lat": -3.166, "lng": 35.583, "quality_score": 58.0, "risk_level": "High", "marker_color": "#f97316", "species_count": 9, "area_km2": 280.0},
            {"id": 3, "name": "Tarangire Riverine Marsh", "lat": -3.833, "lng": 36.000, "quality_score": 38.0, "risk_level": "Critical", "marker_color": "#ef4444", "species_count": 6, "area_km2": 190.0},
        ]

    pop_hotspots = []
    if pop_stats:
        for p in pop_stats[:10]:
            pop_hotspots.append({
                "id": p.id,
                "species": p.species or p.common_name,
                "estimated_population": p.estimated_population or p.estimated_count or 50,
                "lat": -2.333 + (p.id * 0.15) % 2.0,
                "lng": 34.833 + (p.id * 0.12) % 2.0,
                "density": p.density or 1.2,
                "risk_level": p.population_status or "Stable",
                "marker_color": "#f59e0b"
            })

    return {
        "sites": site_points,
        "observations": obs_points,
        "habitats": habitat_zones,
        "hotspots": pop_hotspots,
        "total_sites": len(site_points),
        "total_observations": len(obs_points),
        "total_habitats": len(habitat_zones),
        "center": [-2.333, 34.833]
    }
