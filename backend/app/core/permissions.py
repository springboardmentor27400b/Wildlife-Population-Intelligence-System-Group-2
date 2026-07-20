from fastapi import Depends
from app.middleware.auth import RoleChecker

# Roles
ADMIN = "Administrator"
RESEARCHER = "Wildlife Researcher"
CONSERVATION = "Conservation Officer"
FOREST = "Forest Department Officer"

# Permission Maps
ADMIN_ONLY = RoleChecker([ADMIN])
SURVEY_ACCESS = RoleChecker([ADMIN, RESEARCHER, CONSERVATION])
THREAT_ACCESS = RoleChecker([ADMIN, CONSERVATION])
FIELD_OPERATIONS_ACCESS = RoleChecker([ADMIN, FOREST])
