from pathlib import Path
import pandas as pd


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_DIR = PROJECT_ROOT / "datasets" / "snapshot_serengeti"

ALL_IMAGES_FILE = DATASET_DIR / "all_images.csv"
CONSENSUS_FILE = DATASET_DIR / "consensus_data.csv"
GOLD_STANDARD_FILE = DATASET_DIR / "gold_standard_data.csv"


# ---------------------------------------------------------
# Check files
# ---------------------------------------------------------

for file_path in [
    ALL_IMAGES_FILE,
    CONSENSUS_FILE,
    GOLD_STANDARD_FILE,
]:
    if not file_path.exists():
        raise FileNotFoundError(
            f"Dataset file not found: {file_path}"
        )


# ---------------------------------------------------------
# Load CSV files
# ---------------------------------------------------------

print("\nLoading Snapshot Serengeti data...\n")

all_images = pd.read_csv(ALL_IMAGES_FILE)
consensus = pd.read_csv(CONSENSUS_FILE)
gold_standard = pd.read_csv(GOLD_STANDARD_FILE)


# ---------------------------------------------------------
# Display basic information
# ---------------------------------------------------------

print("========== FILE INFORMATION ==========")

print("\nall_images.csv")
print("Rows:", len(all_images))
print("Columns:", list(all_images.columns))

print("\nconsensus_data.csv")
print("Rows:", len(consensus))
print("Columns:", list(consensus.columns))

print("\ngold_standard_data.csv")
print("Rows:", len(gold_standard))
print("Columns:", list(gold_standard.columns))


# ---------------------------------------------------------
# Species counts
# ---------------------------------------------------------

print("\n========== SPECIES COUNTS ==========")

species_counts = (
    gold_standard["Species"]
    .value_counts()
)

print(species_counts.to_string())


# ---------------------------------------------------------
# Number of unique capture events
# ---------------------------------------------------------

print("\n========== UNIQUE CAPTURE EVENTS ==========")

print(
    "all_images:",
    all_images["CaptureEventID"].nunique()
)

print(
    "gold_standard:",
    gold_standard["CaptureEventID"].nunique()
)

print(
    "consensus:",
    consensus["CaptureEventID"].nunique()
)


# ---------------------------------------------------------
# Number of species per capture event
# ---------------------------------------------------------

species_per_event = (
    gold_standard
    .groupby("CaptureEventID")["Species"]
    .nunique()
)

print("\n========== CAPTURE EVENT ANALYSIS ==========")

print(
    "Single-species events:",
    (species_per_event == 1).sum()
)

print(
    "Multiple-species events:",
    (species_per_event > 1).sum()
)


# ---------------------------------------------------------
# Single-species events only
# ---------------------------------------------------------

single_species_events = species_per_event[
    species_per_event == 1
].index

single_species_data = gold_standard[
    gold_standard["CaptureEventID"].isin(
        single_species_events
    )
]

print("\n========== SINGLE-SPECIES DATA ==========")

single_species_counts = (
    single_species_data["Species"]
    .value_counts()
)

print(
    single_species_counts.to_string()
)


# ---------------------------------------------------------
# Match species data with image data
# ---------------------------------------------------------

merged = all_images.merge(
    single_species_data[
        ["CaptureEventID", "Species"]
    ],
    on="CaptureEventID",
    how="inner"
)

print("\n========== IMAGE / SPECIES MATCH ==========")

print(
    "Total matched image records:",
    len(merged)
)

print(
    "Unique matched images:",
    merged["URL_Info"].nunique()
)

print(
    "Unique matched capture events:",
    merged["CaptureEventID"].nunique()
)


# ---------------------------------------------------------
# Final species distribution
# ---------------------------------------------------------

print("\n========== FINAL SPECIES DISTRIBUTION ==========")

final_counts = (
    merged["Species"]
    .value_counts()
)

print(final_counts.to_string())


# ---------------------------------------------------------
# Save analysis result
# ---------------------------------------------------------

output_file = (
    DATASET_DIR /
    "snapshot_serengeti_matched.csv"
)

merged.to_csv(
    output_file,
    index=False
)

print("\n========================================")
print("Analysis completed.")
print("Matched dataset saved to:")
print(output_file)
print("========================================\n")