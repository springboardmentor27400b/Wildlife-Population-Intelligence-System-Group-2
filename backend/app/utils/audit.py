import asyncio
from typing import Optional
from fastapi import Request
from app.models.audit_log import AuditLog
from app.models.user import User

def create_audit_log(
    user: Optional[User],
    request: Optional[Request],
    action: str,
    module: str,
    description: str,
    resource_id: Optional[str] = None,
    status: str = "Success",
    severity: str = "INFO"
):
    """
    Helper utility to insert an audit log asynchronously without blocking the main request.
    In Supabase, we insert the dictionary payload.
    """
    
    ip_address = None
    if request and request.client:
        ip_address = request.client.host

    details = {
        "description": description,
        "status": status,
        "severity": severity,
        "user_role": getattr(user, 'role', None) if user else None
    }

    log = AuditLog(
        user_id=str(user.id) if user and getattr(user, 'id', None) else "000000000000000000000000",
        user_name=user.full_name if user and getattr(user, 'full_name', None) else "System/Anonymous",
        action=action,
        module=module,
        entity_id=resource_id,
        entity_type="Unknown",  # Or could be derived
        ip_address=ip_address,
        details=details
    )
    
    # We shouldn't use asyncio.create_task with a synchronous client easily, 
    # but since the request is fire-and-forget, we can wrap the supabase call in a thread.
    from app.database.db import supabase
    def insert_log():
        try:
            supabase.table("audit_logs").insert(log.model_dump(mode='json', exclude_none=True)).execute()
        except Exception as e:
            from app.utils.logger import logger
            logger.error(f"Failed to write audit log to Supabase: {e}")

    asyncio.get_event_loop().run_in_executor(None, insert_log)
