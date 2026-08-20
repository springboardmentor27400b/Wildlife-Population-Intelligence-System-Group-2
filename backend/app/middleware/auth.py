from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session
from app.auth.security import decode_access_token
from app.database.database import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
        email: str | None = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials") from exc

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_roles(*allowed_roles: str):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return current_user

    return role_checker
