from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from database import get_db
from services.auth_service import login_user, register_user

router = APIRouter(tags=["Authentication"])


@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = register_user(db, user)

    if new_user is None:
        raise HTTPException(status_code=400, detail="Email already registered")

    return new_user


@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    token_payload = login_user(db, user)

    if token_payload is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return token_payload
