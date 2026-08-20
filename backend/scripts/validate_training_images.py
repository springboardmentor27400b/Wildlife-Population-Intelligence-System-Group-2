from pathlib import Path
from PIL import Image

IMAGE_DIR = Path("../datasets/species_identification/images")

valid = 0
invalid = 0

print("=" * 60)
print("VALIDATING TRAINING IMAGES")
print("=" * 60)

files = sorted(
    p for p in IMAGE_DIR.iterdir()
    if p.suffix.lower() in {".jpg", ".jpeg"}
)

print(f"Images found: {len(files):,}")
print()

for i, path in enumerate(files, 1):
    try:
        with Image.open(path) as img:
            img.verify()

        valid += 1

    except Exception as exc:
        invalid += 1
        print(f"INVALID: {path.name}")
        print(f"         {exc}")

    if i % 100 == 0 or i == len(files):
        print(
            f"Progress: {i:,}/{len(files):,} | "
            f"Valid: {valid:,} | "
            f"Invalid: {invalid:,}"
        )

print()
print("=" * 60)
print("VALIDATION COMPLETE")
print("=" * 60)
print(f"Total:   {len(files):,}")
print(f"Valid:   {valid:,}")
print(f"Invalid: {invalid:,}")
print("=" * 60)

if invalid:
    raise SystemExit(1)