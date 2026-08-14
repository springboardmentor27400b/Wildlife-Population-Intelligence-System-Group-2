import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging_config import logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log incoming request
        logger.info(f"Incoming request: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            
            logger.info(
                f"Completed request: {request.method} {request.url.path} "
                f"- Status: {response.status_code} - Took: {process_time:.4f}s"
            )
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Failed request: {request.method} {request.url.path} "
                f"- Error: {str(e)} - Took: {process_time:.4f}s",
                exc_info=True
            )
            raise e
