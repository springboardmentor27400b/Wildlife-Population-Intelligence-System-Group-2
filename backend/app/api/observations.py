from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List

from datetime import datetime, timezone

from app.models.observation import ObservationRecord
from app.schemas.observation import ObservationCreate, ObservationUpdate, ObservationVerificationUpdate, ObservationResponse
from app.models.user import User
from app.models.site import MonitoringSite
from app.models.device import SensorDevice
from app.models.upload import FieldUpload
from app.models.notification import Notification
from app.api.auth import get_current_user, require_admin
from app.utils.audit import create_audit_log
from fastapi import Query

router = APIRouter()

def get_role_name(current_user: User) -> str:
    if not hasattr(current_user, 'role') or not current_user.role:
        return ""
    if isinstance(current_user.role, str):
        return current_user.role
    return current_user.role.name if hasattr(current_user.role, 'name') else str(current_user.role)

def check_modify_permission(observation: ObservationRecord, current_user: User):
    if observation.observer_id == str(current_user.id):
        return
    if get_role_name(current_user).lower() != "administrator":
        raise HTTPException(status_code=403, detail="You do not have permission to modify this observation.")


async def resolve_relationships(observation: ObservationRecord, site_id: str, device_id: str = None, upload_id: str = None):
    # Resolve Site
    if site_id:
        try:
            site = await get(MonitoringSite, str(site_id))
            if not site: raise HTTPException(status_code=404, detail="Monitoring site not found.")
            observation.monitoring_site_name = site.site_name
        except Exception:
            raise HTTPException(status_code=404, detail="Invalid monitoring site ID.")
            
    # Resolve Device
    if device_id:
        try:
            device = await get(SensorDevice, str(device_id))
            if device: observation.sensor_device_name = device.device_name
            else: observation.sensor_device_name = None
        except:
            observation.sensor_device_name = None
    else:
        observation.sensor_device_id = None
        observation.sensor_device_name = None
            
    # Resolve Upload
    if upload_id:
        try:
            upload = await get(FieldUpload, str(upload_id))
            if upload:
                observation.file_name = upload.file_name
                observation.file_url = upload.file_url
            else:
                observation.file_name = None
                observation.file_url = None
        except:
            observation.file_name = None
            observation.file_url = None
    else:
        observation.field_upload_id = None
        observation.file_name = None
        observation.file_url = None

@router.post("/", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
async def create_observation(
    obs_in: ObservationCreate, 
    request: Request,
    current_user: User = Depends(get_current_user)
):
    observation = ObservationRecord(
        species_name=obs_in.species_name,
        scientific_name=obs_in.scientific_name,
        observation_type=obs_in.observation_type,
        monitoring_site_id=obs_in.monitoring_site_id,
        monitoring_site_name="",
        sensor_device_id=obs_in.sensor_device_id,
        field_upload_id=obs_in.field_upload_id,
        observed_at=obs_in.observed_at,
        observer_id=str(current_user.id),
        observer_name=current_user.full_name,
        count=obs_in.count,
        confidence_score=obs_in.confidence_score,
        latitude=obs_in.latitude,
        longitude=obs_in.longitude,
        notes=obs_in.notes,
        verification_status="Pending Validation"
    )
    
    await resolve_relationships(
        observation, 
        obs_in.monitoring_site_id, 
        obs_in.sensor_device_id, 
        obs_in.field_upload_id
    )
    
    await insert(observation)
    
    create_audit_log(user=current_user, request=request, action="CREATE_OBSERVATION", module="Observations", description=f"Created observation {observation.id}", resource_id=str(observation.id), severity="INFO")
    
    notif = Notification(
        title="New Wildlife Observation",
        message=f"{current_user.full_name} observed {observation.species_name}.",
        type="observation",
        priority="Medium",
        user_id="admin_all",
        related_resource_id=str(observation.id)
    )
    await insert(notif)
    
    return observation

@router.get("/", response_model=List[ObservationResponse])
async def get_observations(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * limit
    from app.database.db import supabase
    res = supabase.table("observation_records").select("*").order("observed_at", desc=True).range(skip, skip + limit - 1).execute()
    return [ObservationRecord(**d) for d in res.data]

@router.get("/{observation_id}", response_model=ObservationResponse)
async def get_observation(observation_id: str, current_user: User = Depends(get_current_user)):
    observation = await get(ObservationRecord, observation_id)
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    return observation

@router.put("/{observation_id}", response_model=ObservationResponse)
async def update_observation(
    observation_id: str, 
    obs_update: ObservationUpdate, 
    request: Request,
    current_user: User = Depends(get_current_user)
):
    observation = await get(ObservationRecord, observation_id)
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
        
    check_modify_permission(observation, current_user)
    
    update_data = obs_update.model_dump(exclude_unset=True)
    
    requires_relationship_refresh = False
    
    for key, value in update_data.items():
        if key in ["monitoring_site_id", "sensor_device_id", "field_upload_id"]:
            if getattr(observation, key) != value:
                requires_relationship_refresh = True
        setattr(observation, key, value)
        
    if requires_relationship_refresh:
        await resolve_relationships(
            observation, 
            observation.monitoring_site_id, 
            observation.sensor_device_id, 
            observation.field_upload_id
        )
        
    observation.updated_at = datetime.now(timezone.utc)
    await save(observation)
    
    create_audit_log(user=current_user, request=request, action="UPDATE_OBSERVATION", module="Observations", description=f"Updated observation {observation_id}", resource_id=str(observation.id), severity="INFO")
    return observation

@router.patch("/{observation_id}/verify", response_model=ObservationResponse)
async def verify_observation(
    observation_id: str, 
    verify_update: ObservationVerificationUpdate, 
    request: Request,
    current_user: User = Depends(require_admin)
):
    
    observation = await get(ObservationRecord, observation_id)
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
        
    if verify_update.status not in ["Verified", "Rejected"]:
        raise HTTPException(status_code=400, detail="Status must be Verified or Rejected.")
        
    observation.verification_status = verify_update.status
    observation.verified_by = current_user.full_name
    observation.verified_at = datetime.now(timezone.utc)
    observation.updated_at = datetime.now(timezone.utc)
    
    await save(observation)
    
    create_audit_log(user=current_user, request=request, action="VERIFY_OBSERVATION", module="Observations", description=f"Verified observation {observation_id} as {verify_update.status}", resource_id=str(observation.id), severity="INFO")
    
    priority = "Success" if verify_update.status == "Verified" else "High" if verify_update.status == "Rejected" else "Low"
    notif = Notification(
        title=f"Observation {verify_update.status}",
        message=f"Observation of {observation.species_name} was {verify_update.status.lower()} by {current_user.full_name}.",
        type="observation",
        priority=priority,
        user_id=observation.observer_id,
        related_resource_id=str(observation.id)
    )
    await insert(notif)
    
    return observation

@router.delete("/{observation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_observation(
    observation_id: str, 
    request: Request,
    current_user: User = Depends(get_current_user)
):
    observation = await get(ObservationRecord, observation_id)
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
        
    check_modify_permission(observation, current_user)
    await delete(observation)
    create_audit_log(user=current_user, request=request, action="DELETE_OBSERVATION", module="Observations", description=f"Deleted observation {observation_id}", resource_id=str(observation.id), severity="WARNING")
    return {"ok": True}
