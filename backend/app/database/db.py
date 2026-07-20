from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User, Role
from app.models.site import MonitoringSite
from app.models.device import SensorDevice
from app.models.upload import FieldUpload
from app.models.observation import ObservationRecord
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.prediction import PredictionRecord
from datetime import datetime, timezone, timedelta

async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db_name = settings.MONGO_URI.split("/")[-1].split("?")[0]
    if not db_name:
        db_name = "wildlife_db"
    
    await init_beanie(
        database=client[db_name],
        document_models=[User, Role, MonitoringSite, SensorDevice, FieldUpload, ObservationRecord, AuditLog, Notification, PredictionRecord]
    )

    # Seed default roles if they don't exist
    roles_to_seed = [
        "Administrator",
        "Wildlife Researcher",
        "Conservation Officer",
        "Forest Department Officer"
    ]
    for role_name in roles_to_seed:
        existing = await Role.find_one(Role.role_name == role_name)
        if not existing:
            new_role = Role(role_name=role_name)
            await new_role.insert()
            
    # Seed default users if none exist
    users_count = await User.find_all().count()
    if users_count == 0:
        from app.core.security import get_password_hash
        
        default_users = [
            User(
                full_name="Harshitha Admin",
                email="admin@wpis.org",
                password_hash=get_password_hash("password123"),
                role="Administrator",
                organization="WPIS HQ",
                designation="Lead Administrator"
            ),
            User(
                full_name="Dr. Sarah Jenkins",
                email="researcher@wpis.org",
                password_hash=get_password_hash("password123"),
                role="Wildlife Researcher",
                organization="Wildlife Conservation Institute",
                designation="Senior Biologist"
            ),
            User(
                full_name="Officer Ramesh Kumar",
                email="officer@wpis.org",
                password_hash=get_password_hash("password123"),
                role="Conservation Officer",
                organization="Forest Protection Agency",
                designation="Chief Ranger"
            ),
            User(
                full_name="Inspector Amit Singh",
                email="forest@wpis.org",
                password_hash=get_password_hash("password123"),
                role="Forest Department Officer",
                organization="State Forest Department",
                designation="Divisional Forest Officer"
            )
        ]
        for user in default_users:
            await user.insert()
            
    # Retrieve seeded users for relations
    admin_user = await User.find_one(User.role == "Administrator")
    researcher_user = await User.find_one(User.role == "Wildlife Researcher")
    default_owner = str(admin_user.id) if admin_user else "system"
    
    # Seed default sites if none exist
    sites_count = await MonitoringSite.find_all().count()
    if sites_count == 0:
        demo_sites = [
            MonitoringSite(
                site_name="Core Zone Alpha",
                location="Mudumalai National Park",
                state="Tamil Nadu",
                district="Nilgiris",
                latitude=11.5623,
                longitude=76.5412,
                habitat_type="Tropical Dry Forest",
                area_sq_km=45.5,
                description="High priority monitoring zone with dense wildlife movement.",
                status="Active",
                created_by=default_owner
            ),
            MonitoringSite(
                site_name="River Basin South",
                location="Anamalai Tiger Reserve",
                state="Tamil Nadu",
                district="Coimbatore",
                latitude=10.4287,
                longitude=77.0123,
                habitat_type="Wetland",
                area_sq_km=20.0,
                description="Key water source for elephants during dry season.",
                status="Active",
                created_by=default_owner
            )
        ]
        for site in demo_sites:
            await site.insert()
            
    # Seed default devices if none exist
    devices_count = await SensorDevice.find_all().count()
    if devices_count == 0:
        core_site = await MonitoringSite.find_one(MonitoringSite.site_name == "Core Zone Alpha")
        river_site = await MonitoringSite.find_one(MonitoringSite.site_name == "River Basin South")
        
        if core_site and river_site:
            demo_devices = [
                SensorDevice(
                    device_name="CT-001",
                    device_id="CT-001",
                    device_type="Camera Trap",
                    monitoring_site_id=str(core_site.id),
                    monitoring_site_name=core_site.site_name,
                    location=core_site.location,
                    latitude=core_site.latitude,
                    longitude=core_site.longitude,
                    status="Online",
                    battery_level=87,
                    last_active="Just now"
                ),
                SensorDevice(
                    device_name="AS-002",
                    device_id="AS-002",
                    device_type="Acoustic Sensor",
                    monitoring_site_id=str(river_site.id),
                    monitoring_site_name=river_site.site_name,
                    location=river_site.location,
                    latitude=river_site.latitude,
                    longitude=river_site.longitude,
                    status="Online",
                    battery_level=72,
                    last_active="10 mins ago"
                ),
                SensorDevice(
                    device_name="GPS-003",
                    device_id="GPS-003",
                    device_type="GPS Collar",
                    monitoring_site_id=str(core_site.id),
                    monitoring_site_name=core_site.site_name,
                    location=core_site.location,
                    latitude=core_site.latitude,
                    longitude=core_site.longitude,
                    status="Offline",
                    battery_level=18,
                    last_active="3 days ago"
                ),
                SensorDevice(
                    device_name="TS-004",
                    device_id="TS-004",
                    device_type="Temperature Sensor",
                    monitoring_site_id=str(river_site.id),
                    monitoring_site_name=river_site.site_name,
                    location=river_site.location,
                    latitude=river_site.latitude,
                    longitude=river_site.longitude,
                    status="Maintenance",
                    battery_level=45,
                    last_active="2 hours ago"
                )
            ]
            for device in demo_devices:
                await device.insert()

    # Seed default observations if none exist
    obs_count = await ObservationRecord.find_all().count()
    if obs_count == 0:
        core_site = await MonitoringSite.find_one(MonitoringSite.site_name == "Core Zone Alpha")
        river_site = await MonitoringSite.find_one(MonitoringSite.site_name == "River Basin South")
        
        # Get devices
        ct_device = await SensorDevice.find_one(SensorDevice.device_name == "CT-001")
        as_device = await SensorDevice.find_one(SensorDevice.device_name == "AS-002")
        
        observer_id = str(researcher_user.id) if researcher_user else (str(admin_user.id) if admin_user else "system")
        observer_name = researcher_user.full_name if researcher_user else (admin_user.full_name if admin_user else "System Observer")
        
        now = datetime.now(timezone.utc)
        
        demo_observations = [
            ObservationRecord(
                species_name="Bengal Tiger",
                scientific_name="Panthera tigris tigris",
                observation_type="Camera Trap",
                monitoring_site_id=str(core_site.id) if core_site else "system",
                monitoring_site_name=core_site.site_name if core_site else "Core Zone Alpha",
                sensor_device_id=str(ct_device.id) if ct_device else None,
                sensor_device_name=ct_device.device_name if ct_device else None,
                observed_at=now - timedelta(hours=2),
                observer_id=observer_id,
                observer_name=observer_name,
                count=1,
                confidence_score=98.5,
                latitude=core_site.latitude if core_site else 11.5623,
                longitude=core_site.longitude if core_site else 76.5412,
                notes="Healthy adult male Bengal tiger detected moving south along Nilgiri corridor trail.",
                verification_status="Verified"
            ),
            ObservationRecord(
                species_name="Asian Elephant",
                scientific_name="Elephas maximus",
                observation_type="Visual Sight",
                monitoring_site_id=str(core_site.id) if core_site else "system",
                monitoring_site_name=core_site.site_name if core_site else "Core Zone Alpha",
                observed_at=now - timedelta(days=1, hours=4),
                observer_id=observer_id,
                observer_name=observer_name,
                count=3,
                confidence_score=100.0,
                latitude=core_site.latitude if core_site else 11.5623,
                longitude=core_site.longitude if core_site else 76.5412,
                notes="A group of three adult female Asian Elephants foraging near boundary buffer zone.",
                verification_status="Verified"
            ),
            ObservationRecord(
                species_name="Indian Leopard",
                scientific_name="Panthera pardus fusca",
                observation_type="Camera Trap",
                monitoring_site_id=str(core_site.id) if core_site else "system",
                monitoring_site_name=core_site.site_name if core_site else "Core Zone Alpha",
                sensor_device_id=str(ct_device.id) if ct_device else None,
                sensor_device_name=ct_device.device_name if ct_device else None,
                observed_at=now - timedelta(hours=6),
                observer_id=observer_id,
                observer_name=observer_name,
                count=1,
                confidence_score=94.2,
                latitude=core_site.latitude if core_site else 11.5623,
                longitude=core_site.longitude if core_site else 76.5412,
                notes="Young leopard cub spotted climbing tree canopy.",
                verification_status="Pending Validation"
            ),
            ObservationRecord(
                species_name="Lion-tailed Macaque",
                scientific_name="Macaca silenus",
                observation_type="Visual Sight",
                monitoring_site_id=str(river_site.id) if river_site else "system",
                monitoring_site_name=river_site.site_name if river_site else "River Basin South",
                observed_at=now - timedelta(days=3),
                observer_id=observer_id,
                observer_name=observer_name,
                count=6,
                confidence_score=100.0,
                latitude=river_site.latitude if river_site else 10.4287,
                longitude=river_site.longitude if river_site else 77.0123,
                notes="Troop of lion-tailed macaques feeding on wild fruits along river banks.",
                verification_status="Verified"
            ),
            ObservationRecord(
                species_name="Gaur",
                scientific_name="Bos gaurus",
                observation_type="Camera Trap",
                monitoring_site_id=str(river_site.id) if river_site else "system",
                monitoring_site_name=river_site.site_name if river_site else "River Basin South",
                sensor_device_id=str(as_device.id) if as_device else None,
                sensor_device_name=as_device.device_name if as_device else None,
                observed_at=now - timedelta(days=4),
                observer_id=observer_id,
                observer_name=observer_name,
                count=2,
                confidence_score=89.0,
                latitude=river_site.latitude if river_site else 10.4287,
                longitude=river_site.longitude if river_site else 77.0123,
                notes="A pair of adult Gaurs grazing near river basin crossing path.",
                verification_status="Pending Validation"
            ),
            ObservationRecord(
                species_name="Indian Peafowl",
                scientific_name="Pavo cristatus",
                observation_type="Visual Sight",
                monitoring_site_id=str(river_site.id) if river_site else "system",
                monitoring_site_name=river_site.site_name if river_site else "River Basin South",
                observed_at=now - timedelta(days=5),
                observer_id=observer_id,
                observer_name=observer_name,
                count=1,
                confidence_score=100.0,
                latitude=river_site.latitude if river_site else 10.4287,
                longitude=river_site.longitude if river_site else 77.0123,
                notes="Sighting of male Indian Peafowl. Marked as rejected due to double entry correction.",
                verification_status="Rejected"
            )
        ]
        for obs in demo_observations:
            await obs.insert()

    # Seed default audit logs if none exist
    logs_count = await AuditLog.find_all().count()
    if logs_count == 0:
        admin_id = str(admin_user.id) if admin_user else "system"
        admin_name = admin_user.full_name if admin_user else "System"
        
        demo_logs = [
            AuditLog(
                user_id=admin_id,
                user_name=admin_name,
                user_role="Administrator",
                action="USER_SEEDING",
                module="System",
                description="Database initialized and default roles/users seeded successfully.",
                ip_address="127.0.0.1",
                status="Success",
                severity="SUCCESS",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=12)
            ),
            AuditLog(
                user_id=admin_id,
                user_name=admin_name,
                user_role="Administrator",
                action="LOGIN",
                module="Auth",
                description=f"User {admin_name} logged in successfully.",
                ip_address="192.168.1.10",
                status="Success",
                severity="INFO",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=2)
            ),
            AuditLog(
                user_id=str(researcher_user.id) if researcher_user else None,
                user_name=researcher_user.full_name if researcher_user else "Dr. Sarah Jenkins",
                user_role="Wildlife Researcher",
                action="CREATE_OBSERVATION",
                module="Observations",
                description="Uploaded Bengal Tiger camera trap observation record.",
                ip_address="192.168.1.12",
                status="Success",
                severity="INFO",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=1)
            ),
            AuditLog(
                user_id=admin_id,
                user_name=admin_name,
                user_role="Administrator",
                action="UPDATE_DEVICE",
                module="Devices",
                description="Updated Sensor Device CT-001 status to Online.",
                ip_address="192.168.1.10",
                status="Success",
                severity="SUCCESS",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=45)
            ),
            AuditLog(
                user_id=str(researcher_user.id) if researcher_user else None,
                user_name=researcher_user.full_name if researcher_user else "Dr. Sarah Jenkins",
                user_role="Wildlife Researcher",
                action="PASSWORD_CHANGE_FAILED",
                module="Auth",
                description="Failed password change attempt: Incorrect old password.",
                ip_address="192.168.1.12",
                status="Failed",
                severity="WARNING",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=15)
            )
        ]
        for log in demo_logs:
            await log.insert()

    # Seed default notifications if none exist
    notif_count = await Notification.find_all().count()
    if notif_count == 0:
        researcher_id = str(researcher_user.id) if researcher_user else "researcher"
        
        demo_notifications = [
            Notification(
                title="Critical Battery Alert",
                message="Sensor Device GPS-003 is reporting a critical battery level of 18%. Maintenance required.",
                type="sensor",
                priority="High",
                user_id="admin_all",
                is_read=False,
                created_at=datetime.now(timezone.utc) - timedelta(hours=6)
            ),
            Notification(
                title="New Observation Pending Approval",
                message="Dr. Sarah Jenkins submitted a Bengal Tiger observation record that requires validation.",
                type="observation",
                priority="Medium",
                user_id="admin_all",
                is_read=False,
                created_at=datetime.now(timezone.utc) - timedelta(hours=1)
            ),
            Notification(
                title="AI Detection Success",
                message="AI species recognition model identified 'Panthera tigris' with 98.5% confidence.",
                type="prediction",
                priority="Success",
                user_id=researcher_id,
                is_read=False,
                created_at=datetime.now(timezone.utc) - timedelta(hours=2)
            ),
            Notification(
                title="System Update Completed",
                message="WPIS has been updated to production version 1.0.0. All modules are online.",
                type="info",
                priority="Low",
                user_id="admin_all",
                is_read=True,
                created_at=datetime.now(timezone.utc) - timedelta(days=2)
            )
        ]
        for notif in demo_notifications:
            await notif.insert()
