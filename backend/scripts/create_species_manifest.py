from pathlib import Path
import pandas as pd


INPUT = Path(
    "../datasets/snapshot_serengeti/"
    "snapshot_serengeti_matched.csv"
)

OUTPUT_DIR = Path(
    "../datasets/species_identification"
)

OUTPUT = OUTPUT_DIR / "species_manifest.csv"


SPECIES = [
    "wildebeest",
    "zebra",
    "hartebeest",
    "buffalo",
    "gazelleThomsons",
    "impala",
    "warthog",
    "giraffe",
    "elephant",
    "gazelleGrants",
]


print("Loading matched dataset...")

df = pd.read_csv(INPUT)

print("Original records:", len(df))

# Keep only selected species
df = df[df["Species"].isin(SPECIES)].copy()

# Remove duplicate image paths
df = df.drop_duplicates(subset=["URL_Info"])

# Remove missing values
df = df.dropna(
    subset=[
        "CaptureEventID",
        "URL_Info",
        "Species",
    ]
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

df.to_csv(
    OUTPUT,
    index=False,
)

print("\n========== SPECIES MANIFEST ==========")
print("Records:", len(df))
print("Species:", df["Species"].nunique())

print("\nImages per species:")
print(
    df["Species"]
    .value_counts()
    .to_string()
)

print("\nSaved to:")
print(OUTPUT.resolve())