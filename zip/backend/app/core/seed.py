from app.models.user import Role
from app.utils.logger import logger

DEFAULT_ROLES = [
    "Administrator",
    "Wildlife Researcher",
    "Conservation Officer",
    "Forest Department Officer"
]

async def seed_roles():
    for role_name in DEFAULT_ROLES:
        existing_role = await Role.find_one(Role.role_name == role_name)
        if not existing_role:
            role = Role(role_name=role_name)
            await role.insert()
            logger.info(f"Seeded role: {role_name}")
