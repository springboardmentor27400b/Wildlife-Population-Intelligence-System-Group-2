from typing import List
from fastapi import Depends
from app.core.exceptions import ForbiddenException
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.auth.permissions import role_has_permission

class RoleGuard:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
        if user_role not in self.allowed_roles:
            raise ForbiddenException(f"Access denied: role must be one of {self.allowed_roles}")
        return current_user

class PermissionGuard:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
        if not role_has_permission(user_role, self.required_permission):
            raise ForbiddenException(f"Access denied: missing permission '{self.required_permission}'")
        return current_user
