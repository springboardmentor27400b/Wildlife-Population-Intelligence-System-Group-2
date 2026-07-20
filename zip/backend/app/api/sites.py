from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from beanie import PydanticObjectId
from datetime import datetime, timezone

from app.models.site import MonitoringSite
from app.schemas.site import MonitoringSiteCreate, MonitoringSiteUpdate, MonitoringSiteResponse
from app.api.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter()

@router.post("/", response_model=MonitoringSiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(site: MonitoringSiteCreate, current_user: User = Depends(get_current_user)):
    new_site = MonitoringSite(
        **site.model_dump(),
        created_by=str(current_user.id)
    )
    await new_site.insert()
    
    notif = Notification(
        title="New Monitoring Site",
        message=f"Monitoring site {new_site.site_name} has been created.",
        type="site",
        priority="Info",
        user_id="admin_all",
        related_resource_id=str(new_site.id)
    )
    await notif.insert()
    
    return new_site

@router.get("/", response_model=List[MonitoringSiteResponse])
async def get_sites(current_user: User = Depends(get_current_user)):
    # Any authenticated user can view sites
    sites = await MonitoringSite.find_all().to_list()
    return sites

@router.get("/{site_id}", response_model=MonitoringSiteResponse)
async def get_site(site_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    site = await MonitoringSite.get(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.put("/{site_id}", response_model=MonitoringSiteResponse)
async def update_site(site_id: PydanticObjectId, site_update: MonitoringSiteUpdate, current_user: User = Depends(get_current_user)):
    site = await MonitoringSite.get(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    if not hasattr(current_user, 'role') or not isinstance(current_user.role, str) or current_user.role.lower() != "administrator":
        # Handle cases where role might be stored as an object or just string
        role_name = current_user.role.name.lower() if hasattr(current_user.role, 'name') else str(current_user.role).lower()
        if role_name != "administrator":
            raise HTTPException(status_code=403, detail="Only Administrators can edit or delete monitoring sites.")
        
    update_data = site_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(site, key, value)
        
    site.updated_at = datetime.now(timezone.utc)
    await site.save()
    return site

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site(site_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    site = await MonitoringSite.get(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    if not hasattr(current_user, 'role') or not isinstance(current_user.role, str) or current_user.role.lower() != "administrator":
        role_name = current_user.role.name.lower() if hasattr(current_user.role, 'name') else str(current_user.role).lower()
        if role_name != "administrator":
            raise HTTPException(status_code=403, detail="Only Administrators can edit or delete monitoring sites.")
        
    await site.delete()
