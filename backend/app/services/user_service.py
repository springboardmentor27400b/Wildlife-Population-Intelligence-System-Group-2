from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.user_repository import user_repository
from app.models.user import User
from app.core.exceptions import NotFoundException

class UserService:
    def get_user_by_id(self, db: Session, user_id: str) -> User:
        user = user_repository.get(db, user_id)
        if not user:
            raise NotFoundException("User not found")
        return user

    def update_user_profile(
        self,
        db: Session,
        *,
        user_id: str,
        full_name: Optional[str] = None,
        email: Optional[str] = None
    ) -> User:
        user = self.get_user_by_id(db, user_id)
        
        update_data = {}
        if full_name is not None:
            update_data["full_name"] = full_name
        if email is not None:
            update_data["email"] = email
            
        return user_repository.update(db, db_obj=user, obj_in=update_data)

user_service = UserService()
