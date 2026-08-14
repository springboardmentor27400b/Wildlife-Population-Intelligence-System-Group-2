import uuid
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.schemas.survey import SurveyResponse, SurveyCreate, SurveyUpdate
from app.schemas.common import PaginatedResult
from app.services.survey_service import survey_service
from app.models.user import User
from app.models.enums import SurveyStatus
from app.auth.guards import PermissionGuard
from app.auth.permissions import (
    PERM_SURVEY_CREATE,
    PERM_SURVEY_UPDATE,
    PERM_SURVEY_DELETE
)
from app.utils.pagination import paginate

router = APIRouter()

@router.get("", response_model=PaginatedResult[SurveyResponse])
def list_surveys(
    search: Optional[str] = Query(None, description="Search by name"),
    status: Optional[SurveyStatus] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and list surveys, with status filtering and pagination.
    """
    skip = (page - 1) * page_size
    items, total = survey_service.search_surveys(
        db, search_query=search, status=status, skip=skip, limit=page_size
    )
    return paginate(items, total, page, page_size)

@router.get("/{survey_id}", response_model=SurveyResponse)
def get_survey(
    survey_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed properties of a survey.
    """
    return survey_service.get_survey(db, survey_id)

@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_survey(
    survey_in: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_SURVEY_CREATE))
):
    """
    Create a new survey (requires permissions).
    """
    return survey_service.create_survey(
        db,
        name=survey_in.name,
        description=survey_in.description,
        start_date=survey_in.start_date,
        end_date=survey_in.end_date,
        status=survey_in.status,
        created_by_id=current_user.id
    )

@router.put("/{survey_id}", response_model=SurveyResponse)
def update_survey(
    survey_id: uuid.UUID,
    survey_in: SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_SURVEY_UPDATE))
):
    """
    Update survey properties (requires permissions).
    """
    return survey_service.update_survey(
        db,
        survey_id=survey_id,
        name=survey_in.name,
        description=survey_in.description,
        start_date=survey_in.start_date,
        end_date=survey_in.end_date,
        status=survey_in.status
    )

@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey(
    survey_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionGuard(PERM_SURVEY_DELETE))
):
    """
    Delete a survey (requires permissions).
    """
    survey_service.delete_survey(db, survey_id)
    return None
