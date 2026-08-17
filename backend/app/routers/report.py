from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.report_service import (
    generate_report,
    generate_excel_report
)

router = APIRouter(
    prefix="/report",
    tags=["Report"]
)


# -----------------------------------
# Generate PDF
# -----------------------------------
@router.post("/generate")
async def report(
    data: dict,
    db: Session = Depends(get_db)
):
    return generate_report(data, db)


# -----------------------------------
# Download PDF
# -----------------------------------
@router.get("/download")
async def download_report(report_type: str = "population"):

    report_files = {
        "wildlife": (
            "uploads/reports/wildlife_survey_report.pdf",
            "wildlife_survey_report.pdf"
        ),
        "population": (
            "uploads/reports/population_report.pdf",
            "population_report.pdf"
        ),
        "biodiversity": (
            "uploads/reports/biodiversity_report.pdf",
            "biodiversity_report.pdf"
        ),
        "habitat": (
            "uploads/reports/habitat_assessment_report.pdf",
            "habitat_assessment_report.pdf"
        ),
        "conservation": (
            "uploads/reports/conservation_report.pdf",
            "conservation_report.pdf"
        ),
    }

    file_info = report_files.get(report_type)

    if not file_info:
        return {
            "success": False,
            "message": "Invalid report type"
        }

    file_path, filename = file_info

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=filename
    )

# -----------------------------------
# Generate Excel
# -----------------------------------
@router.post("/generate-excel")
async def generate_excel(
    data: dict,
    db: Session = Depends(get_db)
):
    return generate_excel_report(data, db)


# -----------------------------------
# Download Excel
# -----------------------------------
@router.get("/download-excel/{filename}")
async def download_excel(filename: str):

    return FileResponse(
        f"uploads/reports/{filename}",
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        filename=filename
    )