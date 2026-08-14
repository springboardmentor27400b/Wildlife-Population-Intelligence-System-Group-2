import logging
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

# Setup logs directory
LOGS_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
os.makedirs(LOGS_DIR, exist_ok=True)
LOG_FILE = LOGS_DIR / "app.log"

# Touch log file if not exists
if not LOG_FILE.exists():
    LOG_FILE.touch()

def setup_logging():
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.StreamHandler(),
            RotatingFileHandler(
                LOG_FILE,
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5,
                encoding="utf-8"
            )
        ]
    )
    
    # Disable propagation for noisy external loggers
    logging.getLogger("uvicorn.access").propagate = True
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

logger = logging.getLogger("wildlife_system")
