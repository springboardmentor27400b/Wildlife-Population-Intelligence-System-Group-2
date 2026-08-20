from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.report_service import (
    generate_csv_report,
    generate_pdf_report,
    generate_xlsx_report,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/csv")
def download_csv(
    db: Session = Depends(get_db),
):
    csv_file = generate_csv_report(db)

    return StreamingResponse(
        csv_file,
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                "attachment; "
                "filename=wildlife_report.csv"
            )
        },
    )


@router.get("/pdf")
def download_pdf(
    db: Session = Depends(get_db),
):
    pdf_file = generate_pdf_report(db)

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                "filename=wildlife_report.pdf"
            )
        },
    )


@router.get("/xlsx")
def download_xlsx(
    db: Session = Depends(get_db),
):
    xlsx_file = generate_xlsx_report(db)

    return StreamingResponse(
        xlsx_file,
        media_type=(
            "application/vnd.openxmlformats-"
            "officedocument.spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                "attachment; "
                "filename=wildlife_report.xlsx"
            )
        },
    )