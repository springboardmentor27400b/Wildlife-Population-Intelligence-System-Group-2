from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config.settings import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    SECRET_KEY,
)
from database import get_db
import models
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==========================
# Password Functions
# ==========================

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


# ==========================
# JWT Token Creation
# ==========================

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return token


# ==========================
# JWT Verification
# ==========================

def verify_token(token: str):

    print("===================================")
    print("TOKEN:", token)
    print("SECRET KEY:", SECRET_KEY)
    print("ALGORITHM:", ALGORITHM)

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        print("PAYLOAD:", payload)

        email = payload.get("sub")

        if email is None:
            print("EMAIL NOT FOUND INSIDE TOKEN")
            raise HTTPException(
                status_code=401,
                detail="Invalid Token",
            )

        return payload

    except JWTError as e:

        print("JWT ERROR:", str(e))

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ==========================
# Current Logged User
# ==========================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    print("TOKEN RECEIVED:", token)

    payload = verify_token(token)

    email = payload.get("sub")

    print("EMAIL FROM TOKEN:", email)

    user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    print("USER FOUND:", user)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user

# ==========================
# ADMIN ACCESS
# ==========================

def get_current_admin(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() not in [
        "admin",
        "administrator"
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user