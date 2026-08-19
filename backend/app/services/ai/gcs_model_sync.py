import os
import sys
import time
import uuid
import tarfile
import hashlib
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger("gcs_model_sync")

try:
    from app.core.config import settings
except ImportError:
    settings = None

# GCS Client singleton
_storage_client = None
_client_init_attempted = False


def get_gcs_config() -> Dict[str, str]:
    """
    Retrieves Google Cloud Storage configuration from settings or environment variables.
    """
    bucket_name = ""
    prefix = ""
    local_cache_dir = ""
    creds_path = ""

    if settings is not None:
        bucket_name = getattr(settings, "GCS_MODEL_BUCKET", "") or ""
        prefix = getattr(settings, "GCS_MODEL_PREFIX", "") or ""
        local_cache_dir = getattr(settings, "LOCAL_MODEL_CACHE_DIR", "") or ""
        creds_path = getattr(settings, "GOOGLE_APPLICATION_CREDENTIALS", "") or ""

    # Fallback to environment variables
    bucket_name = bucket_name or os.environ.get("GCS_MODEL_BUCKET", "") or os.environ.get("GCS_MODELS_BUCKET_NAME", "")
    prefix = prefix or os.environ.get("GCS_MODEL_PREFIX", "") or os.environ.get("GCS_MODELS_PREFIX", "")
    local_cache_dir = local_cache_dir or os.environ.get("LOCAL_MODEL_CACHE_DIR", "") or os.environ.get("MODEL_STORAGE_ROOT", "")
    creds_path = creds_path or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")

    # Set GOOGLE_APPLICATION_CREDENTIALS in env if provided via config
    if creds_path and not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path

    return {
        "bucket_name": bucket_name.strip(),
        "prefix": prefix.strip().strip("/"),
        "local_cache_dir": local_cache_dir.strip(),
        "credentials_path": creds_path.strip(),
    }


def get_storage_client():
    """
    Initializes and caches the Google Cloud Storage client.
    Returns None if google-cloud-storage is unavailable or initialization fails.
    """
    global _storage_client, _client_init_attempted
    if _client_init_attempted:
        return _storage_client

    _client_init_attempted = True
    try:
        from google.cloud import storage
        cfg = get_gcs_config()
        if cfg["credentials_path"] and os.path.exists(cfg["credentials_path"]):
            _storage_client = storage.Client.from_service_account_json(cfg["credentials_path"])
        else:
            try:
                _storage_client = storage.Client()
            except Exception:
                # Support unauthenticated / public access fallback if default credentials fail
                _storage_client = storage.Client.create_anonymous_client()
        logger.info("[GCS Sync] Google Cloud Storage client initialized successfully.")
    except Exception as e:
        logger.debug(f"[GCS Sync] GCS client initialization bypassed/failed: {e}")
        _storage_client = None

    return _storage_client


def verify_file_checksum(file_path: str, expected_checksum: str, algorithm: str = "sha256") -> bool:
    """
    Verifies that the file at file_path matches expected_checksum.
    Supports sha256 and md5.
    """
    if not expected_checksum or not os.path.exists(file_path):
        return False

    hash_func = hashlib.sha256() if algorithm.lower() == "sha256" else hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                hash_func.update(chunk)
        calculated = hash_func.hexdigest().lower()
        matches = (calculated == expected_checksum.strip().lower())
        if not matches:
            logger.warning(
                f"[GCS Sync] Checksum mismatch for {file_path}: expected {expected_checksum}, computed {calculated}"
            )
        return matches
    except Exception as e:
        logger.error(f"[GCS Sync] Error computing checksum for {file_path}: {e}")
        return False


def build_blob_name(asset_path: str) -> str:
    """
    Constructs the full GCS blob name including the configured prefix.
    """
    cfg = get_gcs_config()
    prefix = cfg["prefix"]
    clean_asset = asset_path.lstrip("/").replace("\\", "/")
    if prefix:
        return f"{prefix}/{clean_asset}"
    return clean_asset


def ensure_model_file(
    asset_name: str,
    target_local_path: str,
    expected_checksum: Optional[str] = None,
    checksum_algo: str = "sha256",
    max_retries: int = 3,
    min_bytes: int = 1,
) -> Optional[str]:
    """
    Ensures a model file is present locally.
    1. Checks if target_local_path exists and is non-empty. If so, uses local copy.
    2. If missing, attempts download from Google Cloud Storage with retries and atomic write.
    3. Validates checksum if expected_checksum is provided.
    4. Returns target_local_path on success, or None if GCS sync was unavailable or failed.
    """
    # 1. Local existence check
    if os.path.exists(target_local_path) and os.path.getsize(target_local_path) >= min_bytes:
        if expected_checksum:
            if verify_file_checksum(target_local_path, expected_checksum, checksum_algo):
                logger.info(f"[Model Sync] Model '{asset_name}' found locally and verified at {target_local_path}.")
                return target_local_path
            else:
                logger.warning(f"[Model Sync] Local file {target_local_path} failed checksum verification. Re-downloading...")
        else:
            logger.info(f"[Model Sync] Model '{asset_name}' found locally at {target_local_path}.")
            return target_local_path

    # 2. Check GCS configuration
    cfg = get_gcs_config()
    bucket_name = cfg["bucket_name"]
    if not bucket_name:
        logger.info(f"[Model Sync] GCS_MODEL_BUCKET not configured. Skipping GCS download for '{asset_name}'.")
        return None

    client = get_storage_client()
    if client is None:
        logger.warning(f"[Model Sync] GCS client not available for '{asset_name}'.")
        return None

    blob_name = build_blob_name(asset_name)
    logger.info(f"[Model Sync] Attempting to download '{asset_name}' from gs://{bucket_name}/{blob_name} to {target_local_path}...")

    os.makedirs(os.path.dirname(os.path.abspath(target_local_path)), exist_ok=True)
    temp_local_path = f"{target_local_path}.tmp.{uuid.uuid4().hex}"

    for attempt in range(1, max_retries + 1):
        try:
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            
            if not blob.exists():
                logger.warning(f"[Model Sync] GCS blob 'gs://{bucket_name}/{blob_name}' does not exist.")
                return None

            blob.download_to_filename(temp_local_path)

            if os.path.getsize(temp_local_path) < min_bytes:
                raise IOError(f"Downloaded file '{temp_local_path}' is smaller than minimum required size ({min_bytes} bytes).")

            if expected_checksum:
                if not verify_file_checksum(temp_local_path, expected_checksum, checksum_algo):
                    raise ValueError(f"Checksum verification failed for downloaded asset '{asset_name}'.")

            # Atomic rename to target path
            os.replace(temp_local_path, target_local_path)
            logger.info(f"[Model Sync] Successfully downloaded '{asset_name}' from GCS (gs://{bucket_name}/{blob_name}) -> {target_local_path}.")
            return target_local_path

        except Exception as e:
            logger.warning(f"[Model Sync] GCS download attempt {attempt}/{max_retries} for '{asset_name}' failed: {e}")
            if os.path.exists(temp_local_path):
                try:
                    os.remove(temp_local_path)
                except Exception:
                    pass
            if attempt < max_retries:
                time.sleep(1.5 ** attempt)

    logger.error(f"[Model Sync] All {max_retries} GCS download attempts failed for '{asset_name}'.")
    return None


def ensure_model_directory(
    asset_prefix_or_tar: str,
    target_local_dir: str,
    max_retries: int = 3,
) -> Optional[str]:
    """
    Ensures a directory of model files (e.g. Hugging Face snapshot or SpeciesNet cache) is present locally.
    1. Checks if target_local_dir exists and contains files.
    2. If missing, checks GCS for either a .tar.gz bundle (e.g. asset_prefix_or_tar + '.tar.gz') or
       downloads all blobs matching the prefix into target_local_dir.
    3. Returns target_local_dir on success, or None on failure.
    """
    if os.path.exists(target_local_dir) and os.path.isdir(target_local_dir):
        files = os.listdir(target_local_dir)
        if files:
            logger.info(f"[Model Sync] Model directory '{asset_prefix_or_tar}' found locally with {len(files)} items at {target_local_dir}.")
            return target_local_dir

    cfg = get_gcs_config()
    bucket_name = cfg["bucket_name"]
    if not bucket_name:
        logger.info(f"[Model Sync] GCS_MODEL_BUCKET not configured. Skipping GCS directory sync for '{asset_prefix_or_tar}'.")
        return None

    client = get_storage_client()
    if client is None:
        logger.warning(f"[Model Sync] GCS client not available for directory '{asset_prefix_or_tar}'.")
        return None

    os.makedirs(target_local_dir, exist_ok=True)

    # 1. Try downloading a tar.gz bundle first if available
    tar_asset_name = f"{asset_prefix_or_tar.rstrip('/')}.tar.gz"
    tar_blob_name = build_blob_name(tar_asset_name)
    
    try:
        bucket = client.bucket(bucket_name)
        tar_blob = bucket.blob(tar_blob_name)
        if tar_blob.exists():
            logger.info(f"[Model Sync] Found archive bundle gs://{bucket_name}/{tar_blob_name}. Downloading and extracting...")
            temp_tar = os.path.join(target_local_dir, f"bundle_{uuid.uuid4().hex}.tar.gz")
            tar_blob.download_to_filename(temp_tar)
            with tarfile.open(temp_tar, "r:gz") as tar:
                tar.extractall(path=target_local_dir)
            if os.path.exists(temp_tar):
                os.remove(temp_tar)
            logger.info(f"[Model Sync] Successfully extracted archive '{tar_asset_name}' into {target_local_dir}.")
            return target_local_dir
    except Exception as e:
        logger.warning(f"[Model Sync] Failed to download/extract tar bundle for '{asset_prefix_or_tar}': {e}")

    # 2. Try prefix-based multi-blob download
    blob_prefix = build_blob_name(asset_prefix_or_tar).rstrip("/") + "/"
    try:
        bucket = client.bucket(bucket_name)
        blobs = list(bucket.list_blobs(prefix=blob_prefix))
        if not blobs:
            logger.warning(f"[Model Sync] No blobs found under prefix gs://{bucket_name}/{blob_prefix}.")
            return None

        logger.info(f"[Model Sync] Syncing {len(blobs)} blobs from gs://{bucket_name}/{blob_prefix} to {target_local_dir}...")
        for b in blobs:
            if b.name.endswith("/"):
                continue
            relative_path = b.name[len(blob_prefix):]
            dest_file = os.path.join(target_local_dir, relative_path.replace("/", os.sep))
            os.makedirs(os.path.dirname(dest_file), exist_ok=True)
            temp_dest = f"{dest_file}.tmp.{uuid.uuid4().hex}"
            b.download_to_filename(temp_dest)
            os.replace(temp_dest, dest_file)

        logger.info(f"[Model Sync] Successfully synced directory '{asset_prefix_or_tar}' from GCS.")
        return target_local_dir
    except Exception as e:
        logger.error(f"[Model Sync] Failed multi-blob sync for directory '{asset_prefix_or_tar}': {e}")
        return None
