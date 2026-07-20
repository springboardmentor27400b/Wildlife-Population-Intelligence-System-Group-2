from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from beanie import PydanticObjectId
from datetime import datetime, timezone

from app.models.device import SensorDevice
from app.schemas.device import SensorDeviceCreate, SensorDeviceUpdate, SensorDeviceResponse
from app.models.site import MonitoringSite
from app.api.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter()

def require_admin(current_user: User):
    if not hasattr(current_user, 'role') or not isinstance(current_user.role, str) or current_user.role.lower() != "administrator":
        role_name = current_user.role.name.lower() if hasattr(current_user.role, 'name') else str(current_user.role).lower()
        if role_name != "administrator":
            raise HTTPException(status_code=403, detail="Only Administrators can manage sensor devices.")

@router.post("/", response_model=SensorDeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(device: SensorDeviceCreate, current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    
    # Check duplicate device_id
    existing_device = await SensorDevice.find_one(SensorDevice.device_id == device.device_id)
    if existing_device:
        raise HTTPException(status_code=409, detail="A device with this Device ID already exists.")
        
    # Validate monitoring site
    try:
        site = await MonitoringSite.get(PydanticObjectId(device.monitoring_site_id))
    except Exception:
        site = None
        
    if not site:
        raise HTTPException(status_code=404, detail="Selected monitoring site was not found.")
        
    new_device = SensorDevice(**device.model_dump())
    await new_device.insert()
    return new_device

@router.get("/", response_model=List[SensorDeviceResponse])
async def get_devices(current_user: User = Depends(get_current_user)):
    # Any authenticated user can view devices
    devices = await SensorDevice.find_all().to_list()
    return devices

@router.get("/{device_id}", response_model=SensorDeviceResponse)
async def get_device(device_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    device = await SensorDevice.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put("/{device_id}", response_model=SensorDeviceResponse)
async def update_device(device_id: PydanticObjectId, device_update: SensorDeviceUpdate, current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    
    device = await SensorDevice.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    if device_update.monitoring_site_id and device_update.monitoring_site_id != device.monitoring_site_id:
        try:
            site = await MonitoringSite.get(PydanticObjectId(device_update.monitoring_site_id))
        except Exception:
            site = None
        if not site:
            raise HTTPException(status_code=404, detail="Selected monitoring site was not found.")
            
    update_data = device_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(device, key, value)
        
    device.updated_at = datetime.now(timezone.utc)
    await device.save()
    
    if device_update.status in ["Offline", "Inactive"] and device_update.status != getattr(device, 'status', None):
        notif = Notification(
            title="Sensor Offline",
            message=f"Sensor device {device.device_name} is now {device_update.status}.",
            type="sensor",
            priority="High",
            user_id="admin_all",
            related_resource_id=str(device.id)
        )
        await notif.insert()
        
    return device

@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(device_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    
    device = await SensorDevice.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    await device.delete()
