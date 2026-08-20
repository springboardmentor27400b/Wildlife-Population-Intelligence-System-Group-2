from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_DIR = PROJECT_ROOT / "datasets" / "snapshot_serengeti"

MATCHED_FILE = DATASET_DIR / "snapshot_serengeti_matched.csv"


df = pd.read_csv(MATCHED_FILE)

# Select one common species
test = df[df["Species"] == "zebra"].head(1)

if test.empty:
    raise RuntimeError("No zebra image found.")

row = test.iloc[0]

print("\n========== TEST IMAGE ==========")
print("CaptureEventID:", row["CaptureEventID"])
print("Species:", row["Species"])
print("Image path:", row["URL_Info"])
print("================================\n")