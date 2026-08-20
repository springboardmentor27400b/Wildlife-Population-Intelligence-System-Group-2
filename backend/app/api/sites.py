from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from datetime import datetime, timezone

from app.models.site import MonitoringSite
from app.schemas.site import MonitoringSiteCreate, MonitoringSiteUpdate, MonitoringSiteResponse
from app.api.auth import get_current_user, require_admin
from app.models.user import User
from app.models.notification import Notification

router = APIRouter()

@router.post("/", response_model=MonitoringSiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(site: MonitoringSiteCreate, current_user: User = Depends(require_admin)):
    new_site = MonitoringSite(
        **site.model_dump(),
        created_by=str(current_user.id)
    )
    await insert(new_site)
    
    notif = Notification(
        title="New Monitoring Site",
        message=f"Monitoring site {new_site.site_name} has been created.",
        type="site",
        priority="Info",
        user_id="admin_all",
        related_resource_id=str(new_site.id)
    )
    await insert(notif)
    
    return new_site

@router.get("/", response_model=List[MonitoringSiteResponse])
async def get_sites(current_user: User = Depends(get_current_user)):
    # Any authenticated user can view sites
    sites = await find_all(MonitoringSite)
    return sites

@router.get("/{site_id}", response_model=MonitoringSiteResponse)
async def get_site(site_id: str, current_user: User = Depends(get_current_user)):
    site = await get(MonitoringSite, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.put("/{site_id}", response_model=MonitoringSiteResponse)
async def update_site(site_id: str, site_update: MonitoringSiteUpdate, current_user: User = Depends(require_admin)):
    site = await get(MonitoringSite, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    update_data = site_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(site, key, value)
        
    site.updated_at = datetime.now(timezone.utc)
    await save(site)
    return site

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site(site_id: str, current_user: User = Depends(require_admin)):
    site = await get(MonitoringSite, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    await delete(site)
