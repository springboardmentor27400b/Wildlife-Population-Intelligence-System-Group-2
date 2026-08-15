from pathlib import Path

from dataset_loader import load_dataset
from model_builder import build_model
from callbacks import get_callbacks
import json
BASE_DIR = Path(__file__).resolve().parent.parent

PROJECT_ROOT = BASE_DIR.parent

DATASET_PATH = (
    PROJECT_ROOT
    / "datasets"
    / "animal-datasets"
    / "animals"
    / "animals"
    / "animals"
)
print("=" * 60)
print("WildSight AI - Wildlife Species Recognition Training")
print("=" * 60)

print("\nLoading Dataset...\n")
print("Dataset Path:")
print(DATASET_PATH)
print("Exists:", DATASET_PATH.exists())
train_ds, val_ds, class_names = load_dataset(DATASET_PATH)
with open(MODEL_PATH / "class_names.json", "w") as file:
    json.dump(class_names, file)
print(f"Number of Species : {len(class_names)}")
print("\nSpecies List:\n")
print(class_names)

print("\nBuilding MobileNetV2 Model...\n")

model = build_model(len(class_names))

print("\nStarting Model Training...\n")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=3,
    callbacks=get_callbacks()
)

print("\nTraining Completed Successfully!")

print("\nBest Model Saved At:")
print(BASE_DIR / "models" / "wildlife_classifier.keras")