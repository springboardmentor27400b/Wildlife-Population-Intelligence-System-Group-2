from fastapi import APIRouter, HTTPException, Response, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.pdf_generator import generate_analysis_pdf
from app.services.excel_generator import generate_analytics_excel
from app.api.deps import get_current_user
from app.models.sql import User

router = APIRouter()

class ExportPDFRequest(BaseModel):
    report_type: str  # "image", "audio", "population", "biodiversity", "habitat", "conservation", "ecosystem_health"
    filename: Optional[str] = "analysis_report.pdf"
    result: Optional[Dict[str, Any]] = None

class ExportExcelRequest(BaseModel):
    report_type: str  # "population", "biodiversity", "habitat", "conservation", "ecosystem_health"
    filename: Optional[str] = "analytics_report.xlsx"
    result: Optional[Dict[str, Any]] = None
    user_info: Optional[Dict[str, Any]] = None

@router.post("/export-pdf")
async def export_analysis_pdf(payload: ExportPDFRequest):
    """
    Generates and downloads a clean, formatted PDF report for Image, Audio, or Analytics modules.
    """
    try:
        result_dict = payload.result if payload.result is not None else {}
        pdf_bytes = generate_analysis_pdf(
            report_type=payload.report_type,
            filename=payload.filename or "analysis_file",
            result=result_dict
        )
        safe_filename = f"Wildlife_{payload.report_type.capitalize()}_Analysis_Report.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@router.post("/export-excel")
async def export_analytics_excel(
    payload: ExportExcelRequest
):
    """
    Generates and downloads a clean, styled Excel spreadsheet (.xlsx) for any Analytics module,
    stamping the authenticated logged-in user's details into the spreadsheet header.
    """
    try:
        # Extract user info passed from payload or default to active researcher
        user_info = payload.user_info or {
            "full_name": "Wildlife Researcher",
            "email": "researcher@wildlife.org",
            "role": "Researcher"
        }
        result_dict = payload.result if payload.result is not None else {}
        excel_bytes = generate_analytics_excel(
            report_type=payload.report_type,
            user_info=user_info,
            data=result_dict
        )
        safe_filename = f"Wildlife_{payload.report_type.capitalize()}_Report.xlsx"
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Excel report: {str(e)}")
