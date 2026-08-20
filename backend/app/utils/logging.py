import json
import logging
import os
from datetime import datetime, timezone
from typing import Any


class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "context"):
            payload.update(record.context)
        return json.dumps(payload, default=str)


def configure_logging() -> None:
    root_logger = logging.getLogger()
    if root_logger.handlers:
        return

    handler = logging.StreamHandler()
    handler.setFormatter(StructuredFormatter())
    root_logger.addHandler(handler)
    root_logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
