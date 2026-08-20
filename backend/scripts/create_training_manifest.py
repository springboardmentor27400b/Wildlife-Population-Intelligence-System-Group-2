from pathlib import Path

import pandas as pd


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_FILE = (
    BASE_DIR
    / "datasets"
    / "species_identification"
    / "species_manifest.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "datasets"
    / "species_identification"
    / "training_manifest.csv"
)


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

EVENTS_PER_SPECIES = 50

RANDOM_SEED = 42


# ---------------------------------------------------------
# Load manifest
# ---------------------------------------------------------

print("Loading species manifest...")

df = pd.read_csv(INPUT_FILE)

print(f"Original records: {len(df):,}")
print(f"Original species: {df['Species'].nunique()}")
print(f"Original capture events: {df['CaptureEventID'].nunique():,}")


# ---------------------------------------------------------
# Select balanced capture events
# ---------------------------------------------------------

selected_events = []

for species in sorted(df["Species"].unique()):

    species_df = df[df["Species"] == species]

    events = (
        species_df["CaptureEventID"]
        .drop_duplicates()
        .sample(
            n=min(EVENTS_PER_SPECIES, species_df["CaptureEventID"].nunique()),
            random_state=RANDOM_SEED,
        )
        .tolist()
    )

    selected_events.extend(
        [(event_id, species) for event_id in events]
    )


# ---------------------------------------------------------
# Build training manifest
# ---------------------------------------------------------

selected_event_df = pd.DataFrame(
    selected_events,
    columns=["CaptureEventID", "Species"],
)

training_df = df.merge(
    selected_event_df,
    on=["CaptureEventID", "Species"],
    how="inner",
)


# ---------------------------------------------------------
# Remove accidental duplicate image paths
# ---------------------------------------------------------

training_df = training_df.drop_duplicates(
    subset=["URL_Info"]
).reset_index(drop=True)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True,
)

training_df.to_csv(
    OUTPUT_FILE,
    index=False,
)


# ---------------------------------------------------------
# Report
# ---------------------------------------------------------

print()
print("=" * 50)
print("TRAINING MANIFEST")
print("=" * 50)

print(f"Species: {training_df['Species'].nunique()}")
print(
    f"Capture events: "
    f"{training_df['CaptureEventID'].nunique():,}"
)
print(f"Images: {len(training_df):,}")

print()
print("Capture events per species:")

print(
    training_df
    .groupby("Species")["CaptureEventID"]
    .nunique()
    .sort_values(ascending=False)
    .to_string()
)

print()
print("Images per species:")

print(
    training_df["Species"]
    .value_counts()
    .sort_index()
    .to_string()
)

print()
print("Saved to:")
print(OUTPUT_FILE)
print("=" * 50)