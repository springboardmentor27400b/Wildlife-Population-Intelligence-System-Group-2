from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_DIR = PROJECT_ROOT / "datasets" / "snapshot_serengeti"

ALL_IMAGES_FILE = DATASET_DIR / "all_images.csv"


df = pd.read_csv(ALL_IMAGES_FILE)

print("Total records:", len(df))
print("\nFirst 10 image paths:\n")

for value in df["URL_Info"].head(10):
    print(value)


print("\nTesting URL construction...")