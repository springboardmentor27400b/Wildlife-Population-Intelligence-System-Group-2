from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.models.monitoring_site import MonitoringSite
from app.schemas.monitoring import MonitoringCreate

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

async def get_site(monitoring_id: str) -> MonitoringSite:
    try:
        site = await MonitoringSite.get(PydanticObjectId(monitoring_id))
    except Exception:
        site = None
    if not site:
        raise HTTPException(status_code=404, detail="Monitoring record not found.")
    return site

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_monitoring(monitoring: MonitoringCreate, current_user=Depends(get_current_user)):
    site = MonitoringSite(**monitoring.dict())
    await site.insert()
    return site

@router.get("/")
async def get_sites(current_user=Depends(get_current_user)):
    return await MonitoringSite.find_all().to_list()

@router.put("/{monitoring_id}")
async def update_monitoring(monitoring_id: str, monitoring: MonitoringCreate, current_user=Depends(get_current_user)):
    site = await get_site(monitoring_id)
    for field, value in monitoring.dict().items():
        setattr(site, field, value)
    await site.save()
    return site

@router.delete("/{monitoring_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_monitoring(monitoring_id: str, current_user=Depends(get_current_user)):
    site = await get_site(monitoring_id)
    await site.delete()
