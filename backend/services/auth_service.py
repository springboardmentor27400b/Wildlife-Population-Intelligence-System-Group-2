import crud
import schemas
from auth import create_access_token


def register_user(db, user: schemas.UserCreate):
    return crud.create_user(db, user)


def login_user(db, user: schemas.UserLogin):
    db_user = crud.login_user(db, user)

    if db_user is None:
        return None

    token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }
