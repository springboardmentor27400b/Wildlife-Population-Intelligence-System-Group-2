import os
import zipfile
import hashlib
import requests
from pathlib import Path
from typing import Dict, Any, Optional
from app.core.logging_config import logger

class DatasetManager:
    """
    Robust manager for pipeline datasets download, checksum verification, 
    automatic extraction, zip cleanup, and dataset subsetting.
    """
    def __init__(self, cache_dir: str = "/tmp/dataset_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
    def download_file(self, url: str, dest_path: Path, expected_sha256: Optional[str] = None) -> bool:
        """
        Downloads file with resume support and optional SHA-256 checksum verification.
        """
        temp_dest = dest_path.with_suffix(".tmp")
        headers = {}
        
        # Check if partial download exists
        initial_pos = 0
        if temp_dest.exists():
            initial_pos = temp_dest.stat().st_size
            headers["Range"] = f"bytes={initial_pos}-"
            logger.info(f"Resuming download from byte position: {initial_pos}")
            
        try:
            r = requests.get(url, headers=headers, stream=True, timeout=30)
            
            # If server doesn't support range or we get an error, restart from scratch
            if r.status_code == 416:
                logger.warning("Range request not supported or range unsatisfiable. Restarting download.")
                initial_pos = 0
                r = requests.get(url, stream=True, timeout=30)
                
            mode = "ab" if initial_pos > 0 and r.status_code == 206 else "wb"
            
            with open(temp_dest, mode) as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        
            # Rename temp file to final destination
            if dest_path.exists():
                dest_path.unlink()
            temp_dest.rename(dest_path)
            
            # Verify checksum
            if expected_sha256:
                logger.info("Verifying file checksum...")
                sha256 = hashlib.sha256()
                with open(dest_path, "rb") as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        sha256.update(chunk)
                computed = sha256.hexdigest()
                
                if computed != expected_sha256:
                    logger.error(f"Checksum validation failed. Expected: {expected_sha256}, Got: {computed}")
                    dest_path.unlink()
                    return False
                    
            logger.info(f"Successfully downloaded file: {dest_path}")
            return True
            
        except Exception as e:
            logger.error(f"File download failed: {str(e)}")
            return False

    def extract_dataset(self, zip_path: Path, extract_to: Path, cleanup_archive: bool = True) -> bool:
        """
        Extracts zip file to target directory and removes zip archive to save disk space.
        """
        if not zip_path.exists():
            logger.error(f"Zip archive not found for extraction: {zip_path}")
            return False
            
        try:
            extract_to.mkdir(parents=True, exist_ok=True)
            logger.info(f"Extracting {zip_path} to {extract_to}...")
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
                
            logger.info("Extraction completed successfully.")
            
            if cleanup_archive:
                logger.info(f"Deleting archive file to free up storage: {zip_path}")
                zip_path.unlink()
                
            return True
        except Exception as e:
            logger.error(f"Dataset extraction failed: {str(e)}")
            return False

    def create_representative_subset(self, src_dir: Path, dest_dir: Path, samples_per_class: int = 10):
        """
        Generates a light representative subset of the dataset classes for development mode.
        """
        import shutil
        if not src_dir.exists():
            return
            
        logger.info(f"Generating representative dataset subset (samples_per_class={samples_per_class})...")
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        # Traverse class folders
        for class_dir in src_dir.iterdir():
            if class_dir.is_dir():
                dest_class_dir = dest_dir / class_dir.name
                dest_class_dir.mkdir(exist_ok=True)
                
                # Copy subset of files
                files = list(class_dir.glob("*"))
                for f in files[:samples_per_class]:
                    shutil.copy2(f, dest_class_dir / f.name)
                    
        logger.info(f"Subset generated at: {dest_dir}")

dataset_manager = DatasetManager()
