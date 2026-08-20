from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
from fastapi import APIRouter
from app.models.user import Role

router = APIRouter()

@router.get("", response_model=list[str])
async def get_roles():
    roles = await find_all(Role)
    return [role.role_name for role in roles]
