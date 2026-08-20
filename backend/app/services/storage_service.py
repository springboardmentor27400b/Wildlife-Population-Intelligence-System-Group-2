import os
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import UploadFile

from PIL import Image

UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads"
IMAGE_DIR = UPLOAD_ROOT / "images"
AUDIO_DIR = UPLOAD_ROOT / "audio"
PREDICTIONS_DIR = UPLOAD_ROOT / "predictions"
CROPS_DIR = UPLOAD_ROOT / "crops"
AUDIO_PLOTS_DIR = UPLOAD_ROOT / "audio_plots"
THUMBNAILS_DIR = UPLOAD_ROOT / "thumbnails"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac"}
MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024
MAX_AUDIO_SIZE_BYTES = 100 * 1024 * 1024


def ensure_upload_directories() -> None:
    for directory in (IMAGE_DIR, AUDIO_DIR, PREDICTIONS_DIR, CROPS_DIR, AUDIO_PLOTS_DIR, THUMBNAILS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def create_image_thumbnail(image_path: str | Path) -> str:
    ensure_upload_directories()
    try:
        path = Path(image_path)
        if not path.exists():
            return str(image_path)
        thumb_name = f"{uuid4().hex}_thumb.jpg"
        thumb_path = THUMBNAILS_DIR / thumb_name
        with Image.open(path) as img:
            img = img.convert("RGB")
            img.thumbnail((200, 200))
            img.save(thumb_path, "JPEG", quality=85)
        return str(thumb_path)
    except Exception:
        return str(image_path)


def to_relative_upload_path(absolute_path: str | Path) -> str:
    path = Path(absolute_path)
    try:
        return path.relative_to(UPLOAD_ROOT).as_posix()
    except ValueError:
        p_str = path.as_posix()
        if "uploads/" in p_str:
            return p_str.split("uploads/")[-1]
        return p_str


def to_public_upload_url(relative_path: str) -> str:
    rel = relative_path.lstrip("/").lstrip("\\")
    return f"/api/uploads/{rel}"


def sanitize_filename(original_name: str) -> str:
    if not original_name:
        return "upload"
    stem = Path(original_name).stem
    suffix = Path(original_name).suffix.lower()
    sanitized_stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip(".-") or "upload"
    return f"{sanitized_stem}{suffix}"


def save_upload(file: UploadFile, kind: str) -> dict[str, Any]:
    ensure_upload_directories()
    if not file.filename:
        raise ValueError("A file name is required")

    extension = Path(file.filename).suffix.lower()
    if kind == "image" and extension not in IMAGE_EXTENSIONS:
        raise ValueError("Unsupported image format. Allowed: jpg, jpeg, png")
    if kind == "audio" and extension not in AUDIO_EXTENSIONS:
        raise ValueError("Unsupported audio format. Allowed: wav, mp3, flac")

    max_bytes = MAX_IMAGE_SIZE_BYTES if kind == "image" else MAX_AUDIO_SIZE_BYTES
    file.file.seek(0, os.SEEK_END)
    size_bytes = file.file.tell()
    file.file.seek(0)
    if size_bytes > max_bytes:
        raise ValueError(f"{kind.title()} file exceeds the maximum allowed size of {max_bytes // (1024 * 1024)}MB")

    target_dir = IMAGE_DIR if kind == "image" else AUDIO_DIR
    target_name = f"{uuid4().hex}{extension}"
    destination = target_dir / target_name

    while destination.exists():
        target_name = f"{uuid4().hex}{extension}"
        destination = target_dir / target_name

    with destination.open("wb") as handle:
        shutil.copyfileobj(file.file, handle)

    return {
        "storage_path": str(destination),
        "relative_path": destination.relative_to(UPLOAD_ROOT).as_posix(),
        "original_filename": sanitize_filename(file.filename),
        "stored_filename": destination.name,
        "size_bytes": size_bytes,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
