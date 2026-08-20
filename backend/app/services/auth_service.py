from sqlalchemy.orm import Session

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.models.user import User
from app.schemas.user import UserRegister


def register_user(db: Session, user: UserRegister):
    existing = db.query(User).filter(
        (User.email == user.email) |
        (User.username == user.username)
    ).first()

    if existing:
        return None

    new_user = User(
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role_id=user.role_id,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(
        password,
        user.hashed_password
    ):
        return None

    token = create_access_token(
        {
            "id": user.id,
            "sub": user.email,
            "role": user.role_id,
            "username": user.username,
        }
    )

    return token