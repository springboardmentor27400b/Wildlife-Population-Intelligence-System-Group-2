import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sql import Alert, Device, MonitoringSite

DEFAULT_ADMIN_ALERTS = [
    {
        "alert_type": "endangered_species",
        "severity": "CRITICAL",
        "title": "CRITICAL: Panthera tigris (Bengal Tiger) Detected",
        "message": "High-confidence detection (96.4%) of adult Bengal Tiger logged at Bandipur Core Sector A (CamTrap #104). Immediate anti-poaching patrol alert active.",
        "target_role": "Admin",
        "details": {"species": "Panthera tigris", "iucn_category": "Endangered", "confidence": 0.964, "location": "Bandipur Core Sector A"}
    },
    {
        "alert_type": "endangered_species",
        "severity": "HIGH",
        "title": "ENDANGERED: Elephas maximus (Asian Elephant) Herd Sighting",
        "message": "A herd of 7 Asian Elephants detected migrating through Nagarhole River Corridor. Bioacoustic sensor #08 logged trumpet call sequence.",
        "target_role": "Admin",
        "details": {"species": "Elephas maximus", "iucn_category": "Endangered", "count": 7, "location": "Nagarhole River Corridor"}
    },
    {
        "alert_type": "population_decline",
        "severity": "CRITICAL",
        "title": "POPULATION DECLINE: Indian Leopard Count Dropped (-24.2%)",
        "message": "6-Month deduplicated telemetry indicates a 24.2% drop in Panthera pardus detections in Mudumalai Edge Perimeter over the last 30 days.",
        "target_role": "Admin",
        "details": {"species": "Panthera pardus", "decline_percentage": 24.2, "baseline_n": 42, "current_n": 32, "period": "30 days"}
    },
    {
        "alert_type": "population_decline",
        "severity": "HIGH",
        "title": "POPULATION DECLINE: Sambar Deer Telemetry Dip (-18.5%)",
        "message": "Deduplicated population count for Cervus unicolor decreased from 66 to 54 animals across Sector C camera traps.",
        "target_role": "Admin",
        "details": {"species": "Cervus unicolor", "decline_percentage": 18.5, "baseline_n": 66, "current_n": 54}
    },
    {
        "alert_type": "habitat_degradation",
        "severity": "HIGH",
        "title": "HABITAT DEGRADATION: Severe NDVI Drop (0.342) in Sector C",
        "message": "Sentinel-2 satellite GIS processing detected severe vegetation stress and scrub canopy loss. Mean NDVI fell below healthy 0.50 threshold.",
        "target_role": "Admin",
        "details": {"mean_ndvi": 0.342, "healthy_threshold": 0.50, "degraded_land_pct": 22.1, "location": "Mudumalai Edge Sector C"}
    },
    {
        "alert_type": "habitat_degradation",
        "severity": "MEDIUM",
        "title": "HABITAT WARNING: River Corridor Moisture Loss",
        "message": "GIS remote sensing telemetry indicates riparian zone surface water reduction of 12.4% along Wayanad Southern perimeter.",
        "target_role": "Admin",
        "details": {"water_loss_pct": 12.4, "location": "Wayanad Sanctuary Southern Zone"}
    },
    {
        "alert_type": "device_alert",
        "severity": "CRITICAL",
        "title": "DEVICE OFFLINE: AudioSensor #12 (Nagarhole Sector B)",
        "message": "Bioacoustic monitor #12 failed scheduled telemetry heartbeat ping. Device status set to OFFLINE. Field maintenance dispatch required.",
        "target_role": "Admin",
        "details": {"device_type": "AudioSensor", "device_id": 12, "status": "OFFLINE", "last_seen": "3 hours ago"}
    },
    {
        "alert_type": "device_alert",
        "severity": "HIGH",
        "title": "DEVICE LOW BATTERY: CameraTrap #105 (Battery 11%)",
        "message": "Solar charge controller reported critical battery drop to 11% on CameraTrap #105 at Bandipur Sector A.",
        "target_role": "Admin",
        "details": {"device_type": "CameraTrap", "device_id": 105, "battery_pct": 11, "status": "MAINTENANCE"}
    },
    {
        "alert_type": "conservation_notification",
        "severity": "HIGH",
        "title": "CONSERVATION PRIORITY: Critical Tiger Protection Strategy Generated",
        "message": "Conservation Engine Priority Formula (w1*IUCN + w2*(1-pi) + w3*Threats) assigned Panthera tigris a Critical Priority level.",
        "target_role": "Admin",
        "details": {"priority_score": 94.5, "assigned_level": "Critical Priority", "formula": "Data-Driven IUCN Weighted Score"}
    },
    {
        "alert_type": "conservation_notification",
        "severity": "INFO",
        "title": "CONSERVATION ADVISORY: 6-Month Population Benchmark Finalized",
        "message": "System wide deduplicated population benchmark logged 142 total animals across 100 km² monitoring area (Density: 1.42 animals/km²).",
        "target_role": "Admin",
        "details": {"total_deduplicated_count": 142, "density": 1.42, "effective_area_km2": 100.0}
    }
]

DEFAULT_FOREST_DEPT_ALERTS = [
    {
        "alert_type": "device_alert",
        "severity": "CRITICAL",
        "title": "HARDWARE CRITICAL: AudioSensor #12 Offline",
        "message": "Bioacoustic Sensor #12 in Sector B lost telemetry ping. Status set to OFFLINE. Field maintenance dispatch required.",
        "target_role": "ForestDept",
        "details": {"device_type": "AudioSensor", "device_id": 12, "status": "OFFLINE", "sector": "Nagarhole Sector B"}
    },
    {
        "alert_type": "device_alert",
        "severity": "HIGH",
        "title": "HARDWARE WARNING: CameraTrap #105 Low Battery (11%)",
        "message": "Solar battery charger reported critical voltage drop to 11% on CameraTrap #105 at Bandipur Sector A.",
        "target_role": "ForestDept",
        "details": {"device_type": "CameraTrap", "device_id": 105, "battery_pct": 11, "status": "MAINTENANCE"}
    },
    {
        "alert_type": "habitat_degradation",
        "severity": "HIGH",
        "title": "PARK HABITAT WARNING: NDVI Drop (0.342) Sector C",
        "message": "Satellite GIS Sentinel-2 processing detected vegetation canopy loss and soil drying in Mudumalai Edge Perimeter.",
        "target_role": "ForestDept",
        "details": {"mean_ndvi": 0.342, "healthy_threshold": 0.50, "degraded_land_pct": 22.1, "location": "Mudumalai Edge Sector C"}
    },
    {
        "alert_type": "habitat_degradation",
        "severity": "MEDIUM",
        "title": "HABITAT ADVISORY: River Moisture Reduction (12.4%)",
        "message": "Riparian stream vegetation moisture index dropped 12.4% along Wayanad Southern perimeter.",
        "target_role": "ForestDept",
        "details": {"water_loss_pct": 12.4, "location": "Wayanad Sanctuary Southern Zone"}
    },
    {
        "alert_type": "population_decline",
        "severity": "HIGH",
        "title": "POPULATION TELEMETRY DIP: Sambar Deer (-18.5%)",
        "message": "Camera trap deduplicated count for Cervus unicolor decreased from 66 to 54 animals in Sector C.",
        "target_role": "ForestDept",
        "details": {"species": "Cervus unicolor", "decline_pct": 18.5, "sector": "Sector C"}
    },
    {
        "alert_type": "conservation_notification",
        "severity": "INFO",
        "title": "PARK ADVISORY: Check Dam Construction Recommended",
        "message": "Conservation Engine recommended constructing 2 check dams along Nagarhole River Corridor to preserve moisture.",
        "target_role": "ForestDept",
        "details": {"action": "Check Dam Construction", "location": "Nagarhole River Corridor", "priority": "High"}
    }
]

DEFAULT_OFFICER_ALERTS = [
    {
        "alert_type": "endangered_species",
        "severity": "CRITICAL",
        "title": "TACTICAL ALERT: Bengal Tiger Detection Core Sector A",
        "message": "High-confidence adult Panthera tigris sighting logged at CamTrap #104. Anti-poaching patrol unit 4 dispatched to Sector A perimeter.",
        "target_role": "Officer",
        "details": {"species": "Panthera tigris", "iucn_category": "Endangered", "confidence": 0.964, "location": "Bandipur Core Sector A"}
    },
    {
        "alert_type": "endangered_species",
        "severity": "HIGH",
        "title": "ENFORCEMENT ALERT: Asian Elephant Herd Movement",
        "message": "Herd of 7 Asian Elephants logged moving towards village perimeter at Nagarhole River Corridor. Deploy deterrent patrol.",
        "target_role": "Officer",
        "details": {"species": "Elephas maximus", "iucn_category": "Endangered", "count": 7, "location": "Nagarhole River Corridor"}
    },
    {
        "alert_type": "population_decline",
        "severity": "CRITICAL",
        "title": "FIELD AUDIT ALERT: Leopard Count Dip (-24.2%)",
        "message": "30-Day population index drop logged for Panthera pardus in Mudumalai Edge. Patrol investigation mandated.",
        "target_role": "Officer",
        "details": {"species": "Panthera pardus", "decline_percentage": 24.2, "location": "Mudumalai Edge Perimeter"}
    },
    {
        "alert_type": "habitat_degradation",
        "severity": "HIGH",
        "title": "PATROL WARNING: Habitat Canopy Degradation Sector C",
        "message": "Satellite GIS telemetry flagged severe vegetation stress and clear-cutting indicators along Sector C border.",
        "target_role": "Officer",
        "details": {"mean_ndvi": 0.342, "location": "Mudumalai Edge Sector C"}
    },
    {
        "alert_type": "conservation_notification",
        "severity": "HIGH",
        "title": "PATROL DIRECTIVE: Anti-Poaching Blitz Protocol Active",
        "message": "Conservation Priority Engine activated Level-1 Protection Directive for Tiger habitat corridors across Bandipur-Nagarhole border.",
        "target_role": "Officer",
        "details": {"directive": "Anti-Poaching Blitz", "priority": "Critical", "assigned_units": "Units 2, 4, 7"}
    }
]

DEFAULT_RESEARCHER_ALERTS = [
    {
        "alert_type": "population_decline",
        "severity": "HIGH",
        "title": "RESEARCH ALERT: Demographic Shift Dip (-24.2%) Panthera pardus",
        "message": "6-Month deduplicated capture-recapture analysis flagged a 24.2% reduction in Panthera pardus encounter rate across Mudumalai Edge Perimeter.",
        "target_role": "Researcher",
        "details": {"species": "Panthera pardus", "decline_percentage": 24.2, "baseline_n": 42, "current_n": 32, "model": "Capture-Recapture Lincoln-Petersen"}
    },
    {
        "alert_type": "population_decline",
        "severity": "HIGH",
        "title": "RESEARCH ALERT: Sambar Deer Density Decrease",
        "message": "Camera trap occupancy modeling registered a statistically significant density dip for Cervus unicolor in Sector C.",
        "target_role": "Researcher",
        "details": {"species": "Cervus unicolor", "decline_pct": 18.5, "sector": "Sector C", "p_val": 0.034}
    },
    {
        "alert_type": "habitat_degradation",
        "severity": "HIGH",
        "title": "GIS TELEMETRY: Canopy Cover Loss (NDVI 0.342)",
        "message": "Sentinel-2 satellite spectral band processing indicated scrub canopy desiccation and moisture loss in Sector C.",
        "target_role": "Researcher",
        "details": {"mean_ndvi": 0.342, "healthy_threshold": 0.50, "satellite": "Sentinel-2 MSI", "location": "Mudumalai Edge Sector C"}
    },
    {
        "alert_type": "habitat_degradation",
        "severity": "MEDIUM",
        "title": "GIS TELEMETRY: Riparian Zone Surface Water Dip",
        "message": "Remote sensing telemetry registered a 12.4% surface water surface reduction along Wayanad Southern river corridor.",
        "target_role": "Researcher",
        "details": {"water_loss_pct": 12.4, "sensor": "Landsat-9 OLI", "location": "Wayanad Sanctuary Southern Zone"}
    },
    {
        "alert_type": "conservation_notification",
        "severity": "INFO",
        "title": "SCIENTIFIC ADVISORY: 6-Month Population Benchmark Finalized",
        "message": "System wide deduplicated population benchmark logged 142 total animals across 100 km² monitoring area (Density: 1.42 animals/km²). Ready for publication export.",
        "target_role": "Researcher",
        "details": {"total_deduplicated_count": 142, "density": 1.42, "effective_area_km2": 100.0, "dataset_id": "DS-2026-BIO-09"}
    }
]

def seed_admin_alerts_if_empty(db: Session):
    """
    Ensures default initial seed alerts exist for Admin, ForestDept, Officer, and Researcher roles across allowed alert types.
    """
    admin_count = db.query(func.count(Alert.id)).filter(Alert.target_role == "Admin").scalar()
    if admin_count == 0:
        for alert_data in DEFAULT_ADMIN_ALERTS:
            alert_obj = Alert(
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                title=alert_data["title"],
                message=alert_data["message"],
                target_role=alert_data["target_role"],
                details=alert_data["details"],
                is_read=False
            )
            db.add(alert_obj)

    fd_count = db.query(func.count(Alert.id)).filter(Alert.target_role == "ForestDept").scalar()
    if fd_count == 0:
        for alert_data in DEFAULT_FOREST_DEPT_ALERTS:
            alert_obj = Alert(
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                title=alert_data["title"],
                message=alert_data["message"],
                target_role=alert_data["target_role"],
                details=alert_data["details"],
                is_read=False
            )
            db.add(alert_obj)

    off_count = db.query(func.count(Alert.id)).filter(Alert.target_role == "Officer").scalar()
    if off_count == 0:
        for alert_data in DEFAULT_OFFICER_ALERTS:
            alert_obj = Alert(
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                title=alert_data["title"],
                message=alert_data["message"],
                target_role=alert_data["target_role"],
                details=alert_data["details"],
                is_read=False
            )
            db.add(alert_obj)

    res_count = db.query(func.count(Alert.id)).filter(Alert.target_role == "Researcher").scalar()
    if res_count == 0:
        for alert_data in DEFAULT_RESEARCHER_ALERTS:
            alert_obj = Alert(
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                title=alert_data["title"],
                message=alert_data["message"],
                target_role=alert_data["target_role"],
                details=alert_data["details"],
                is_read=False
            )
            db.add(alert_obj)

    db.commit()

def sync_device_alerts(db: Session):
    """
    Scans SQL devices table for any OFFLINE or MAINTENANCE devices and ensures a device_alert exists.
    """
    offline_devices = db.query(Device).filter(
        func.upper(Device.status).in_(["OFFLINE", "MAINTENANCE"])
    ).all()

    for dev in offline_devices:
        title = f"DEVICE ALERT: {dev.type} #{dev.id} ({dev.status})"
        existing = db.query(Alert).filter(
            Alert.alert_type == "device_alert",
            Alert.device_id == dev.id
        ).first()

        if not existing:
            for role in ["Admin", "ForestDept"]:
                alert_obj = Alert(
                    alert_type="device_alert",
                    severity="CRITICAL" if dev.status.upper() == "OFFLINE" else "HIGH",
                    title=title,
                    message=f"{dev.type} #{dev.id} deployed at Site #{dev.site_id} status is currently {dev.status}.",
                    target_role=role,
                    device_id=dev.id,
                    site_id=dev.site_id,
                    details={"device_type": dev.type, "device_id": dev.id, "status": dev.status},
                    is_read=False
                )
                db.add(alert_obj)
    db.commit()

def trigger_endangered_species_alert(
    db: Session,
    species_name: str,
    common_name: Optional[str] = None,
    iucn_category: str = "Endangered",
    confidence: float = 0.95,
    site_id: Optional[int] = None,
    device_id: Optional[int] = None,
    user_id: Optional[int] = None
) -> Alert:
    """
    Creates and commits a new endangered species sighting alert visible to Researcher, Admin, Officer, and ForestDept.
    """
    disp_common = common_name or species_name
    cat_upper = str(iucn_category or "").upper()
    is_critical = cat_upper in ["CR", "CRITICAL", "EN", "ENDANGERED"] or "tiger" in species_name.lower() or "panda" in species_name.lower()
    
    severity = "CRITICAL" if is_critical else "HIGH"
    title = f"{severity}: {disp_common} ({species_name}) Sighting"
    message = (
        f"AI Vision Inference confirmed high-confidence detection ({confidence * 100:.1f}%) "
        f"of {disp_common} ({species_name}). IUCN Red List Status: {iucn_category}."
    )
    
    details = {
        "species": species_name,
        "common_name": disp_common,
        "iucn_category": iucn_category,
        "confidence": round(confidence, 3),
        "site_id": site_id,
        "device_id": device_id,
        "uploaded_by_user_id": user_id,
        "alert_timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    alert_obj = Alert(
        alert_type="endangered_species",
        severity=severity,
        title=title,
        message=message,
        target_role="ALL",  # Broadcast to ALL roles (Admin, Researcher, Officer, ForestDept)
        site_id=site_id,
        device_id=device_id,
        details=details,
        is_read=False
    )
    db.add(alert_obj)
    db.commit()
    db.refresh(alert_obj)
    return alert_obj

def get_role_alerts_summary(db: Session, user_role: str = "Admin") -> dict:
    """
    Returns summary statistics for the user role across allowed alert categories.
    For Researcher: 4 allowed types (endangered_species, population_decline, habitat_degradation, conservation_notification).
    For Officer: 4 allowed types (endangered_species, population_decline, habitat_degradation, conservation_notification).
    For ForestDept: 4 allowed types (device_alert, habitat_degradation, population_decline, conservation_notification).
    For Admin: All 5 alert types.
    """
    seed_admin_alerts_if_empty(db)
    sync_device_alerts(db)

    query = db.query(Alert)
    if user_role == "Admin":
        query = query.filter(Alert.target_role.in_(["Admin", "ALL"]))
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "device_alert", "conservation_notification"]
    elif user_role == "ForestDept":
        allowed_types = ["endangered_species", "device_alert", "habitat_degradation", "population_decline", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["ForestDept", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    elif user_role == "Officer":
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["Officer", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    elif user_role == "Researcher":
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_(["Researcher", "ALL", "Admin"]), Alert.alert_type.in_(allowed_types))
    else:
        allowed_types = ["endangered_species", "population_decline", "habitat_degradation", "conservation_notification"]
        query = query.filter(Alert.target_role.in_([user_role, "ALL"]), Alert.alert_type.in_(allowed_types))

    alerts = query.all()

    unread_total = sum(1 for a in alerts if not a.is_read)
    total = len(alerts)

    counts_by_type = {t: 0 for t in allowed_types}
    counts_by_severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "INFO": 0}

    for a in alerts:
        if a.alert_type in counts_by_type:
            counts_by_type[a.alert_type] += 1
        if a.severity in counts_by_severity:
            counts_by_severity[a.severity] += 1

    return {
        "unread_total": unread_total,
        "total": total,
        "counts_by_type": counts_by_type,
        "counts_by_severity": counts_by_severity
    }

def get_admin_alerts_summary(db: Session) -> dict:
    return get_role_alerts_summary(db, "Admin")

