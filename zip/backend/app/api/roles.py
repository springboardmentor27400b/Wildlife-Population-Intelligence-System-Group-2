from fastapi import APIRouter
from app.models.user import Role

router = APIRouter()

@router.get("", response_model=list[str])
async def get_roles():
    roles = await Role.find_all().to_list()
    return [role.role_name for role in roles]
