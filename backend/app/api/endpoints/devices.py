from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.sql import Device, MonitoringSite, User, Alert, Observation
from app.models.schemas import DeviceCreate, DeviceUpdate, DeviceResponse

router = APIRouter()

@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def create_device(
    device_in: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Researcher", "Admin"]))
):
    # Verify site exists
    site = db.query(MonitoringSite).filter(MonitoringSite.id == device_in.site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring site not found")
        
    db_device = Device(
        site_id=device_in.site_id,
        type=device_in.type,
        model_number=device_in.model_number,
        deployment_date=device_in.deployment_date,
        status=device_in.status,
        created_by=current_user.id
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

@router.get("/", response_model=list[DeviceResponse])
def list_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Device).all()

@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return device

@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: int,
    device_in: DeviceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Researcher", "Admin"]))
):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
        
    if device_in.site_id is not None:
        site = db.query(MonitoringSite).filter(MonitoringSite.id == device_in.site_id).first()
        if not site:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring site not found")
        db_device.site_id = device_in.site_id
        
    if device_in.type is not None:
        db_device.type = device_in.type
    if device_in.model_number is not None:
        db_device.model_number = device_in.model_number
    if device_in.deployment_date is not None:
        db_device.deployment_date = device_in.deployment_date
    if device_in.status is not None:
        db_device.status = device_in.status
        
    db.commit()
    db.refresh(db_device)
    return db_device

@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"]))
):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
        
    device_type = db_device.type
    device_model = db_device.model_number or "N/A"
    site_id = db_device.site_id

    # Resolve site name for informative audit notification
    site = db.query(MonitoringSite).filter(MonitoringSite.id == site_id).first()
    site_name = site.name if site else f"Site #{site_id}"
    admin_name = current_user.full_name or current_user.email

    # Disassociate dependent foreign keys in alerts and observations
    db.query(Alert).filter(Alert.device_id == device_id).update({Alert.device_id: None}, synchronize_session=False)
    db.query(Observation).filter(Observation.device_id == device_id).update({Observation.device_id: None}, synchronize_session=False)

    # Delete the device record
    db.delete(db_device)

    # Issue broadcast notification to ALL roles that this admin deleted this device
    delete_alert = Alert(
        alert_type="conservation_notification",
        severity="INFO",
        title=f"ADMIN ACTION: Device #{device_id} ({device_type}) Removed",
        message=f"Admin {admin_name} deleted {device_type} #{device_id} (Model: {device_model}) from {site_name}.",
        target_role="ALL",
        site_id=site_id,
        device_id=None,
        details={
            "action": "device_deleted",
            "admin_name": admin_name,
            "admin_email": current_user.email,
            "deleted_device_id": device_id,
            "device_type": device_type,
            "site_id": site_id,
            "site_name": site_name
        },
        is_read=False
    )
    db.add(delete_alert)

    db.commit()
    return None
