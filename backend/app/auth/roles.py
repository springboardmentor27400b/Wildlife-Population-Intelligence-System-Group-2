from app.core.constants import ROLE_ADMIN, ROLE_RESEARCHER, ROLE_OFFICER, ROLE_FOREST_DEPT

# Hierarchy: higher can perform lower operations if needed, but we will make explicit checks.
# Administrator has full permissions.
# Wildlife Researcher can perform research work.
# Conservation Officer can register devices and observations.
# Forest Department Officer has read-only access and logging observations.

ROLE_HIERARCHY = {
    ROLE_ADMIN: [ROLE_ADMIN, ROLE_RESEARCHER, ROLE_OFFICER, ROLE_FOREST_DEPT],
    ROLE_RESEARCHER: [ROLE_RESEARCHER, ROLE_OFFICER, ROLE_FOREST_DEPT],
    ROLE_OFFICER: [ROLE_OFFICER, ROLE_FOREST_DEPT],
    ROLE_FOREST_DEPT: [ROLE_FOREST_DEPT]
}

def has_role(user_role: str, target_role: str) -> bool:
    """Check if the user_role is equal to or higher than target_role."""
    if user_role not in ROLE_HIERARCHY:
        return False
    return target_role in ROLE_HIERARCHY[user_role]
