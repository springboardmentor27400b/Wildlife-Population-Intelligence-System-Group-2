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

# Fallback downloader helper
def download_model(url: str, dest_path: Path) -> bool:
    try:
        sys.stdout.write(f"Downloading model weights from {url} to {dest_path}...\n")
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as response, open(dest_path, 'wb') as f:
            f.write(response.read())
        sys.stdout.write("Download complete!\n")
        return True
    except Exception as e:
        sys.stderr.write(f"WARNING: Failed to download weights from {url}: {e}\n")
        return False

import urllib.request

# Discover paths dynamically
best_path, last_path, yaml_path = discover_ai_files()

# Fallback download logic for image weights if missing
root_dir = Path(__file__).resolve().parent.parent.parent.parent
backend_dir = root_dir / "backend"
if not best_path and not last_path:
    img_url = os.getenv("MODEL_DOWNLOAD_URL_IMAGE")
    if img_url:
        dest = backend_dir / "best_img.pt"
        if download_model(img_url, dest):
            best_path = dest

# Fallback download logic for audio weights and configuration if missing
audio_dir = Path(__file__).resolve().parent.parent / "models" / "audio"

audio_dest = audio_dir / "best_audio_model.pt"
if not audio_dest.exists():
    audio_url = os.getenv("MODEL_DOWNLOAD_URL_AUDIO")
    if audio_url:
        download_model(audio_url, audio_dest)

pkl_dest = audio_dir / "label_encoder.pkl"
if not pkl_dest.exists():
    pkl_url = os.getenv("AUDIO_LABEL_ENCODER_URL")
    if pkl_url:
        download_model(pkl_url, pkl_dest)

tax_dest = audio_dir / "taxonomy.csv"
if not tax_dest.exists():
    tax_url = os.getenv("AUDIO_TAXONOMY_URL")
    if tax_url:
        download_model(tax_url, tax_dest)

# Check validation rules
missing_files = []
if not best_path and not last_path:
    missing_files.append("YOLO model weights (best.pt or last.pt)")
if not yaml_path:
    missing_files.append("dataset configuration (data.yaml)")

if missing_files:
    sys.stderr.write("\n" + "="*80 + "\n")
    sys.stderr.write("WARNING: AI Subsystem is disabled (missing model weights or dataset config).\n")
    sys.stderr.write("Core system endpoints will remain functional, but AI inference will return errors.\n")
    sys.stderr.write("="*80 + "\n\n")

# Resolve model path
MODEL_PATH = str(best_path) if best_path else None
LAST_PT_PATH = str(last_path) if last_path else None
DATA_YAML_PATH = str(yaml_path) if yaml_path else None

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
