from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
import crud

from database import get_db
from auth import get_current_admin


router = APIRouter(
    prefix="/admin/users",
    tags=["Admin User Management"]
)


# =====================================================
# GET ALL USERS
# =====================================================

@router.get("")
def get_users(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    users = crud.get_all_users(db)

    return users


# =====================================================
# GET SINGLE USER
# =====================================================

@router.get("/{user_id}")
def get_single_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    user = crud.get_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =====================================================
# UPDATE USER ROLE
# =====================================================

@router.put("/{user_id}/role")
def update_role(
    user_id: int,
    user_data: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    user = crud.update_user_role(
        db,
        user_id,
        user_data.role
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =====================================================
# DELETE USER
# =====================================================

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    # Prevent admin from deleting their own account
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    user = crud.delete_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User deleted successfully"
    }