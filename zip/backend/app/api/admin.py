from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.user import UserRead
from app.middleware.auth import RoleChecker

router = APIRouter()

admin_checker = RoleChecker(["Administrator"])

@router.get("/users", response_model=list[UserRead])
async def get_all_users(current_user: User = Depends(admin_checker)):
    users = await User.find_all().to_list()
    return users
