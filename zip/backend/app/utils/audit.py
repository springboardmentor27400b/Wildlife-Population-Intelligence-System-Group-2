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
    """
    
    ip_address = None
    if request and request.client:
        ip_address = request.client.host

    log = AuditLog(
        user_id=str(user.id) if user else None,
        user_name=user.full_name if user else "System/Anonymous",
        user_role=user.role if user else None,
        action=action,
        module=module,
        description=description,
        resource_id=resource_id,
        ip_address=ip_address,
        status=status,
        severity=severity
    )
    
    # Fire and forget
    asyncio.create_task(log.insert())
