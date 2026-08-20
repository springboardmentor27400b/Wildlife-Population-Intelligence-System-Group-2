import argparse
import logging
import os
import shutil
from pathlib import Path
from PIL import Image

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def process_image(src_path: Path, dest_dir: Path, size=(224, 224)):
    try:
        with Image.open(src_path) as img:
            # Check for corruption
            img.verify()
            
        with Image.open(src_path) as img:
            # Convert to RGB, Resize
            img = img.convert("RGB")
            img = img.resize(size, Image.Resampling.LANCZOS)
            dest_path = dest_dir / f"{src_path.stem}.jpg"
            img.save(dest_path, "JPEG", quality=90)
            return True
    except Exception as e:
        logger.warning(f"Corrupted or invalid image {src_path.name}: {e}")
        return False

def preprocess_datasets(images_dir: Path, output_dir: Path):
    logger.info("Starting preprocessing...")
    
    train_dir = output_dir / "train"
    val_dir = output_dir / "val"
    
    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)
    
    files = list(images_dir.glob("*.*"))
    valid_files = [f for f in files if f.suffix.lower() in [".jpg", ".jpeg", ".png"]]
    
    if not valid_files:
        logger.warning("No images found to process.")
        return
        
    # Split 80/20
    split_idx = int(len(valid_files) * 0.8)
    train_files = valid_files[:split_idx]
    val_files = valid_files[split_idx:]
    
    for f in train_files:
        process_image(f, train_dir)
        
    for f in val_files:
        process_image(f, val_dir)

    logger.info(f"Preprocessing complete. Train: {len(train_files)}, Val: {len(val_files)}")

def main():
    parser = argparse.ArgumentParser(description="Preprocess datasets for training.")
    parser.add_argument("--images-dir", type=str, default="../datasets/images", help="Raw images dir.")
    parser.add_argument("--output-dir", type=str, default="../datasets/processed", help="Processed images dir.")
    args = parser.parse_args()

    base_dir = Path(__file__).parent
    img_dir = (base_dir / args.images_dir).resolve()
    out_dir = (base_dir / args.output_dir).resolve()

    preprocess_datasets(img_dir, out_dir)

if __name__ == "__main__":
    main()
