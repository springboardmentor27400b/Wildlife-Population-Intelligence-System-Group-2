from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.survey import Survey
from app.models.monitoring_site import MonitoringSite
from app.models.camera_trap import CameraTrap
from app.models.audio_sensor import AudioSensor
from app.models.observation import Observation
from app.models.enums import DeviceStatus, HabitatType

class DashboardService:
    def get_summary(self, db: Session) -> dict:
        total_surveys = db.query(Survey).count()
        total_sites = db.query(MonitoringSite).count()
        
        # Devices count
        total_camera_traps = db.query(CameraTrap).count()
        total_audio_sensors = db.query(AudioSensor).count()
        total_devices = total_camera_traps + total_audio_sensors
        
        # Active devices count
        active_cameras = db.query(CameraTrap).filter(CameraTrap.status == DeviceStatus.ACTIVE).count()
        active_sensors = db.query(AudioSensor).filter(AudioSensor.status == DeviceStatus.ACTIVE).count()
        active_devices = active_cameras + active_sensors
        
        total_observations = db.query(Observation).count()
        
        # Total AI Analyses (completed/failed analyses)
        from app.models.ai_analysis import AIAnalysis
        total_analyses = db.query(AIAnalysis).filter(
            (AIAnalysis.status == "Completed") | (AIAnalysis.status == "Failed")
        ).count()
        
        # Distinct Species Identified
        total_species_identified = db.query(func.count(func.distinct(Observation.species))).scalar() or 0
        
        # Pending AI Analysis (observations with no completed or running AIAnalysis record)
        pending_analyses = db.query(Observation).filter(
            ~Observation.id.in_(
                db.query(AIAnalysis.observation_id).filter(
                    (AIAnalysis.status == "Completed") | (AIAnalysis.status == "Running")
                )
            )
        ).count()
        
        # Wildlife Health Score from ecological service
        from app.services.ecological_service import ecological_service
        try:
            health_score = int(ecological_service.generate_report(db).get("wildlife_health_score", 0))
        except Exception:
            health_score = 0
            
        # Recent observations activity
        recent_obs_query = (
            db.query(Observation)
            .order_by(Observation.observed_at.desc())
            .limit(5)
            .all()
        )
        recent_observations = [
            {
                "id": str(o.id),
                "species": o.species,
                "count": o.count,
                "observed_at": o.observed_at.isoformat() if o.observed_at else "",
                "ai_status": o.ai_status
            }
            for o in recent_obs_query
        ]

        # 1. Species breakdown
        species_query = (
            db.query(Observation.species, func.sum(Observation.count).label("count"))
            .group_by(Observation.species)
            .order_by(func.sum(Observation.count).desc())
            .limit(5)
            .all()
        )
        species_breakdown = [{"species": s, "count": int(c)} for s, c in species_query]
        
        # 2. Habitat distribution
        habitat_query = (
            db.query(MonitoringSite.habitat_type, func.count(MonitoringSite.id).label("count"))
            .group_by(MonitoringSite.habitat_type)
            .all()
        )
        habitat_distribution = [
            {"habitat_type": h.value if hasattr(h, "value") else h, "count": c} 
            for h, c in habitat_query
        ]
        
        # 3. Sighting timeline (detect SQLite vs PostgreSQL)
        is_sqlite = db.bind.dialect.name == "sqlite"
        if is_sqlite:
            timeline_query = (
                db.query(
                    func.strftime('%Y-%m-%d', Observation.observed_at).label("day"),
                    func.sum(Observation.count).label("count")
                )
                .group_by("day")
                .order_by("day")
                .limit(10)
                .all()
            )
        else:
            timeline_query = (
                db.query(
                    func.date_trunc('day', Observation.observed_at).label("day"),
                    func.sum(Observation.count).label("count")
                )
                .group_by("day")
                .order_by("day")
                .limit(10)
                .all()
            )
            
        sighting_timeline = []
        for d, c in timeline_query:
            if isinstance(d, str):
                date_str = d
            elif d:
                date_str = d.strftime("%Y-%m-%d")
            else:
                date_str = ""
            sighting_timeline.append({"date": date_str, "count": int(c)})
            
        # Device status metrics
        device_statuses = {
            "active": active_devices,
            "inactive": (total_devices - active_devices)
        }
        
        return {
            "total_surveys": total_surveys,
            "total_sites": total_sites,
            "total_devices": total_devices,
            "active_devices": active_devices,
            "total_observations": total_observations,
            "total_analyses": total_analyses,
            "total_species_identified": total_species_identified,
            "pending_analyses": pending_analyses,
            "wildlife_health_score": health_score,
            "recent_observations": recent_observations,
            "species_breakdown": species_breakdown,
            "habitat_distribution": habitat_distribution,
            "sighting_timeline": sighting_timeline,
            "device_statuses": device_statuses
        }


dashboard_service = DashboardService()
