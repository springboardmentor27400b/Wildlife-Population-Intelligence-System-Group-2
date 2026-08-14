import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional

from app.models.notification import Notification
from app.models.observation import Observation
from app.models.species_profile import SpeciesProfile
from app.models.monitoring_site import MonitoringSite
from app.models.camera_trap import CameraTrap
from app.models.audio_sensor import AudioSensor
from app.models.enums import DeviceStatus
from app.services.ecological_service import ecological_service

class NotificationService:
    def create_notification(
        self,
        db: Session,
        notification_type: str,
        title: str,
        message: str,
        severity: str = "medium",
        related_species: Optional[str] = None,
        related_site_id: Optional[uuid.UUID] = None,
        related_device_id: Optional[str] = None,
        recipient_role: Optional[str] = None
    ) -> Notification:
        notif = Notification(
            id=uuid.uuid4(),
            notification_type=notification_type,
            title=title,
            message=message,
            severity=severity,
            related_species=related_species,
            related_site_id=related_site_id,
            related_device_id=related_device_id,
            recipient_role=recipient_role,
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    def get_notifications(
        self,
        db: Session,
        role: Optional[str] = None,
        is_read: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Notification]:
        # Always run automatic checks before returning notifications
        self.generate_automatic_alerts(db)
        
        query = db.query(Notification)
        
        # Role-based notification filtering
        if role and role != "Administrator":
            query = query.filter(
                (Notification.recipient_role == role) | (Notification.recipient_role == None)
            )
            
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
            
        return query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()

    def mark_as_read(self, db: Session, notification_id: uuid.UUID) -> Optional[Notification]:
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if notif:
            notif.is_read = True
            db.commit()
            db.refresh(notif)
        return notif

    def mark_all_as_read(self, db: Session, role: Optional[str] = None) -> int:
        query = db.query(Notification).filter(Notification.is_read == False)
        if role and role != "Administrator":
            query = query.filter(Notification.recipient_role == role)
        
        count = 0
        for notif in query.all():
            notif.is_read = True
            count += 1
            
        if count > 0:
            db.commit()
        return count

    def generate_automatic_alerts(self, db: Session):
        """
        Runs rules on existing database entities to dynamically yield notifications
        for target user roles (Researcher, Conservation, Forest Officer).
        """
        try:
            # 1. Endangered Species Alerts
            observations = db.query(Observation).all()
            for obs in observations:
                # Find profile matching species
                clean_lookup = obs.species.replace(" ", "_").strip()
                profile = db.query(SpeciesProfile).filter(
                    (SpeciesProfile.scientific_name.ilike(f"%{clean_lookup}%")) |
                    (SpeciesProfile.common_name.ilike(f"%{obs.species}%"))
                ).first()
                
                if profile and profile.conservation_status in ["Critically Endangered", "Endangered"]:
                    # Check if alert already exists
                    exists = db.query(Notification).filter(
                        and_(
                            Notification.notification_type == "endangered_species",
                            Notification.related_species == profile.common_name,
                            Notification.related_site_id == obs.site_id
                        )
                    ).first()
                    
                    if not exists:
                        site_name = obs.site.name if obs.site else "Sanctuary Corridor"
                        self.create_notification(
                            db,
                            notification_type="endangered_species",
                            title=f"Endangered Species Sighted",
                            message=f"{profile.conservation_status} species '{profile.common_name}' spotted at site {site_name}.",
                            severity="critical",
                            related_species=profile.common_name,
                            related_site_id=obs.site_id,
                            recipient_role="Conservation Officer"
                        )

            # 2. Population Decline Alerts
            species_profiles = db.query(SpeciesProfile).filter(SpeciesProfile.population_trend == "Decreasing").all()
            for sp in species_profiles:
                exists = db.query(Notification).filter(
                    and_(
                        Notification.notification_type == "population_decline",
                        Notification.related_species == sp.common_name
                    )
                ).first()
                
                if not exists:
                    self.create_notification(
                        db,
                        notification_type="population_decline",
                        title="Species Population Decline Warning",
                        message=f"Global population trend for '{sp.common_name}' is Decreasing. Conservation action suggested.",
                        severity="high",
                        related_species=sp.common_name,
                        recipient_role="Wildlife Researcher"
                    )

            # 3. Habitat Degradation Alerts
            sites = db.query(MonitoringSite).all()
            for s in sites:
                try:
                    report = ecological_service.generate_report(db, s.id)
                    score = report.get("habitat_suitability_score", 50.0)
                    conflict = report.get("human_conflict_level", "Low")
                except Exception:
                    score = 50.0
                    conflict = "Low"
                    
                if score < 60.0 or conflict == "High":
                    exists = db.query(Notification).filter(
                        and_(
                            Notification.notification_type == "habitat_degradation",
                            Notification.related_site_id == s.id
                        )
                    ).first()
                    
                    if not exists:
                        sev = "high" if conflict == "High" else "medium"
                        self.create_notification(
                            db,
                            notification_type="habitat_degradation",
                            title="Habitat Quality Warning",
                            message=f"Monitoring site {s.name} suitability score dropped to {score}% with {conflict} human conflict.",
                            severity=sev,
                            related_site_id=s.id,
                            recipient_role="Conservation Officer"
                        )

            # 4. Device Alerts
            traps = db.query(CameraTrap).filter(CameraTrap.status.in_([DeviceStatus.INACTIVE, DeviceStatus.MAINTENANCE])).all()
            for t in traps:
                exists = db.query(Notification).filter(
                    and_(
                        Notification.notification_type == "device_alert",
                        Notification.related_device_id == str(t.id)
                    )
                ).first()
                if not exists:
                    status_str = t.status.value if hasattr(t.status, 'value') else str(t.status)
                    self.create_notification(
                        db,
                        notification_type="device_alert",
                        title="Camera Trap Issue Detected",
                        message=f"Camera Trap model {t.model} (S/N: {t.serial_number}) status: {status_str}.",
                        severity="medium",
                        related_device_id=str(t.id),
                        related_site_id=t.site_id,
                        recipient_role="Forest Department Officer"
                    )

            sensors = db.query(AudioSensor).filter(AudioSensor.status.in_([DeviceStatus.INACTIVE, DeviceStatus.MAINTENANCE])).all()
            for sn in sensors:
                exists = db.query(Notification).filter(
                    and_(
                        Notification.notification_type == "device_alert",
                        Notification.related_device_id == str(sn.id)
                    )
                ).first()
                if not exists:
                    status_str = sn.status.value if hasattr(sn.status, 'value') else str(sn.status)
                    self.create_notification(
                        db,
                        notification_type="device_alert",
                        title="Audio Sensor Issue Detected",
                        message=f"Audio Sensor model {sn.model} (S/N: {sn.serial_number}) status: {status_str}.",
                        severity="medium",
                        related_device_id=str(sn.id),
                        related_site_id=sn.site_id,
                        recipient_role="Forest Department Officer"
                    )

        except Exception as e:
            print(f"Failed to generate dynamic notifications: {e}")

notification_service = NotificationService()
