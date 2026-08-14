from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_user

# Re-exposing base dependencies for API routers
__all__ = ["get_db", "get_current_user", "get_current_active_user"]
