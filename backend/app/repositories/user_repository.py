from typing import Any, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.user import User

class UserRepository(BaseRepository[User, Any, Any]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(self.model).filter(self.model.email == email).first()

user_repository = UserRepository(User)
