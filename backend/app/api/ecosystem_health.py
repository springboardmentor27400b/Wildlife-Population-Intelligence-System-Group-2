from fastapi import APIRouter, Depends
from typing import Optional, Any
from fastapi.responses import StreamingResponse
from app.services.ecosystem_health_service import EcosystemHealthService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    filters = {"start_date": start_date, "end_date": end_date}
    return await EcosystemHealthService.get_ecosystem_summary(filters)

@router.get("/export/{format_type}")
async def export_data(
    format_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Any = Depends(get_current_user)
):
    filters = {"start_date": start_date, "end_date": end_date}
    if format_type == "excel":
        content = await EcosystemHealthService.export_excel(filters)
        return StreamingResponse(
            content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=ecosystem_health.xlsx"}
        )
    elif format_type == "csv":
        content = await EcosystemHealthService.export_csv(filters)
        return StreamingResponse(
            content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=ecosystem_health.csv"}
        )
    elif format_type == "pdf":
        content = await EcosystemHealthService.export_pdf(filters)
        return StreamingResponse(
            content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=ecosystem_health.pdf"}
        )
    elif format_type == "json":
        content = await EcosystemHealthService.export_json(filters)
        return StreamingResponse(
            content,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=ecosystem_health.json"}
        )
    return {"error": "Invalid format"}

@router.get("/{site_id}")
async def get_site_health(site_id: str, current_user: Any = Depends(get_current_user)):
    data = await EcosystemHealthService.get_ecosystem_summary({})
    sites = data.get("tables", {}).get("site_health", [])
    for site in sites:
        if site.get("site_name", "").lower() == site_id.lower() or site.get("id") == site_id:
            return site
    return {"error": "Site not found"}
