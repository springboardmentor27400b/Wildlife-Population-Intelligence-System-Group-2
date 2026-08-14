import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.user import User
from app.services.report_service import report_service
from app.core.config import settings

import logging

router = APIRouter()
logger = logging.getLogger("wildlife_system")

@router.get("/{analysis_id}/download", response_class=FileResponse)
def download_prediction_pdf_report(
    analysis_id: str,
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    site_id: Optional[str] = Query(None),
    species: Optional[str] = Query(None),
    habitat: Optional[str] = Query(None),
    threat_status: Optional[str] = Query(None, alias="status"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Triggers ReportLab compilation and downloads the styled PDF report.
    Supports 'analysis_id' representing:
      - UUID of AIAnalysis (AI Analysis Report)
      - UUID of Observation (Observation Sighting Report)
      - UUID of Survey (Survey Report)
      - "population" (Population Trends PDF)
      - "ecology" (Ecological Intelligence PDF)
    Supports query parameter '?token=...' or 'Authorization' header.
    """
    # 1. Resolve token from header or query param
    resolved_token = None
    if token:
        resolved_token = token
    elif authorization and authorization.startswith("Bearer "):
        resolved_token = authorization.split(" ")[1]
        
    if not resolved_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in."
        )
        
    # 2. Decode and validate token
    try:
        from app.core.security import decode_access_token
        payload = decode_access_token(resolved_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload."
            )
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Credentials validation failed: {str(e)}"
        )
        
    # 3. Compile report
    try:
        rel_url = report_service.generate_report_by_id(
            db, 
            analysis_id,
            site_id=site_id,
            species=species,
            habitat=habitat,
            status=threat_status,
            start_date=start_date,
            end_date=end_date
        )
        
        # Resolve full path of pdf on disk
        pdf_filename = rel_url.split("/")[-1]
        pdf_file_path = Path(settings.UPLOAD_DIR) / "reports" / pdf_filename
        
        if not pdf_file_path.exists():
             raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail="Generated PDF report file was not found on server disk."
             )
             
        return FileResponse(
            path=str(pdf_file_path),
            filename=pdf_filename,
            media_type="application/pdf"
        )
    except ValueError as val_err:
        logger.warning(f"Validation failure during PDF generation for {analysis_id}: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as e:
        logger.error(f"Failed to generate PDF report for {analysis_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ecological PDF generation failed: {str(e)}"
        )

@router.get("/{analysis_id}/export-excel", response_class=FileResponse)
def export_prediction_excel_report(
    analysis_id: str,
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    site_id: Optional[str] = Query(None),
    species: Optional[str] = Query(None),
    habitat: Optional[str] = Query(None),
    threat_status: Optional[str] = Query(None, alias="status"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Triggers Openpyxl spreadsheet compilation and downloads the Excel file.
    """
    resolved_token = None
    if token:
        resolved_token = token
    elif authorization and authorization.startswith("Bearer "):
        resolved_token = authorization.split(" ")[1]
        
    if not resolved_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in."
        )
        
    try:
        from app.core.security import decode_access_token
        payload = decode_access_token(resolved_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload."
            )
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Credentials validation failed: {str(e)}"
        )
        
    try:
        rel_url = report_service.generate_excel_by_id(
            db, 
            analysis_id,
            site_id=site_id,
            species=species,
            habitat=habitat,
            status=threat_status,
            start_date=start_date,
            end_date=end_date
        )
        
        xls_filename = rel_url.split("/")[-1]
        xls_file_path = Path(settings.UPLOAD_DIR) / "reports" / xls_filename
        
        if not xls_file_path.exists():
             raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail="Generated Excel file was not found on server disk."
             )
             
        return FileResponse(
            path=str(xls_file_path),
            filename=xls_filename,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except ValueError as val_err:
        logger.warning(f"Validation failure during Excel generation for {analysis_id}: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as e:
        logger.error(f"Failed to generate Excel report for {analysis_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Excel generation failed: {str(e)}"
        )

