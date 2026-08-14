import sys
import os
import yaml
import torch
from pathlib import Path
from typing import Dict, Any, Optional

# 1. Recursive Search for AI Files
def discover_ai_files():
    """
    Recursively scans the project workspace to find best.pt, last.pt, and data.yaml.
    """
    # Start scanning from the root of the project
    root_dir = Path(__file__).resolve().parent.parent.parent.parent
    
    best_pt = None
    last_pt = None
    data_yaml = None
    
    for path in root_dir.rglob("*"):
        # Skip dependency and version control directories
        if any(part in path.parts for part in ['node_modules', '.git', 'venv', '__pycache__', 'dist', 'build']):
            continue
        if path.is_file():
            if path.name == "best.pt":
                best_pt = path
            elif path.name == "last.pt":
                last_pt = path
            elif path.name in ["data.yaml", "data.yml"]:
                data_yaml = path
                
    return best_pt, last_pt, data_yaml

# Discover paths dynamically
best_path, last_path, yaml_path = discover_ai_files()

# Check validation rules
missing_files = []
if not best_path and not last_path:
    missing_files.append("YOLO model weights (best.pt or last.pt)")
if not yaml_path:
    missing_files.append("dataset configuration (data.yaml)")

if missing_files:
    # Print clean startup error and exit gracefully
    sys.stderr.write("\n" + "="*80 + "\n")
    sys.stderr.write("STARTUP ERROR: Missing AI Subsystem Configuration Files\n")
    sys.stderr.write("="*80 + "\n")
    sys.stderr.write(f"The following required configuration files are missing:\n")
    for f in missing_files:
        sys.stderr.write(f"  - {f}\n")
    sys.stderr.write("Please place these files inside your project directory and restart the application.\n")
    sys.stderr.write("="*80 + "\n\n")
    sys.exit(1)

# Resolve model path
MODEL_PATH = str(best_path) if best_path else str(last_path)
LAST_PT_PATH = str(last_path) if last_path else None
DATA_YAML_PATH = str(yaml_path)

# 2. Dynamic Class Name Resolution
try:
    with open(DATA_YAML_PATH, "r") as f:
        yaml_content = yaml.safe_load(f)
        names = yaml_content.get("names", {})
        if isinstance(names, list):
            CLASS_NAMES = {i: name for i, name in enumerate(names)}
        elif isinstance(names, dict):
            CLASS_NAMES = {int(k): v for k, v in names.items()}
        else:
            CLASS_NAMES = {}
except Exception as e:
    sys.stderr.write(f"STARTUP ERROR: Failed to parse {DATA_YAML_PATH}: {e}\n")
    sys.exit(1)

# 3. Centralized AI Parameters
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
CONFIDENCE_THRESHOLD = 0.15
IOU_THRESHOLD = 0.45
IMAGE_SIZE = 640
MAX_DETECTIONS = 100

logger_msg = (
    f"AI System Configured Successfully:\n"
    f"  Model Weight: {MODEL_PATH}\n"
    f"  Config YAML:  {DATA_YAML_PATH}\n"
    f"  Device:       {DEVICE}\n"
    f"  Loaded Classes: {len(CLASS_NAMES)} categories"
)
print(logger_msg)
