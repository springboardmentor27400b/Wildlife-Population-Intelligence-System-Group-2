from fastapi import APIRouter, Depends
from typing import Optional
from app.api.auth import get_current_user
from app.models.user import User
from app.services.wildlife_report_service import WildlifeReportService

router = APIRouter()

@router.get("/preview")
async def preview_report(
    report_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    source: Optional[str] = None,
    conservation_status: Optional[str] = None,
    habitat: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Returns a JSON structure for frontend HTML preview."""
    return await WildlifeReportService.get_report_preview(
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        species=species,
        monitoring_site_id=monitoring_site_id,
        source=source,
        conservation_status=conservation_status,
        habitat=habitat,
        user_name=current_user.full_name,
        user_id=str(current_user.id)
    )

@router.get("/export/excel")
async def export_report_excel(
    report_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    source: Optional[str] = None,
    conservation_status: Optional[str] = None,
    habitat: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    return await WildlifeReportService.export_excel(
        current_user=current_user,
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        species=species,
        monitoring_site_id=monitoring_site_id,
        source=source,
        conservation_status=conservation_status,
        habitat=habitat,
        user_name=current_user.full_name,
        user_id=str(current_user.id)
    )

@router.get("/export/pdf")
async def export_report_pdf(
    report_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    source: Optional[str] = None,
    conservation_status: Optional[str] = None,
    habitat: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    return await WildlifeReportService.export_pdf(
        current_user=current_user,
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        species=species,
        monitoring_site_id=monitoring_site_id,
        source=source,
        conservation_status=conservation_status,
        habitat=habitat,
        user_name=current_user.full_name,
        user_id=str(current_user.id)
    )

@router.get("/export/json")
async def export_report_json(
    report_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    source: Optional[str] = None,
    conservation_status: Optional[str] = None,
    habitat: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    return await WildlifeReportService.export_json(
        current_user=current_user,
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        species=species,
        monitoring_site_id=monitoring_site_id,
        source=source,
        conservation_status=conservation_status,
        habitat=habitat,
        user_name=current_user.full_name,
        user_id=str(current_user.id)
    )

@router.get("/export/csv")
async def export_report_csv(
    report_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    species: Optional[str] = None,
    monitoring_site_id: Optional[str] = None,
    source: Optional[str] = None,
    conservation_status: Optional[str] = None,
    habitat: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    return await WildlifeReportService.export_csv(
        current_user=current_user,
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        species=species,
        monitoring_site_id=monitoring_site_id,
        source=source,
        conservation_status=conservation_status,
        habitat=habitat,
        user_name=current_user.full_name,
        user_id=str(current_user.id)
    )

@router.get("/history")
async def get_report_history(
    current_user: User = Depends(get_current_user)
):
    from app.models.report_history import ReportHistory
    history = await ReportHistory.find({"user_id": str(current_user.id)}).sort("-created_at").to_list()
    return history
