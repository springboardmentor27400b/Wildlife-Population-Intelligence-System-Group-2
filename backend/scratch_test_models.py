import sys
import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("test_models")

sys.path.insert(0, str(Path(__file__).resolve().parent))

logger.info("Importing model_manager...")
from app.services.model_manager import model_manager
logger.info("model_manager imported successfully.")

logger.info(f"Running on device: {model_manager.device}")
logger.info(f"HAS_TRANSFORMERS: {os.environ.get('HAS_TRANSFORMERS') or 'not set in env'}")

logger.info("Calling ensure_models()...")
status = model_manager.ensure_models()
logger.info(f"ensure_models() completed. Status: {status}")
