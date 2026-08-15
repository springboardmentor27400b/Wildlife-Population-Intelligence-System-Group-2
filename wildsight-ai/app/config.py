from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "datasets" / "animal-datasets" / "animals" / "animals" / "animals"

MODEL_PATH = BASE_DIR / "models"

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

EPOCHS = 10

MODEL_NAME = "wildlife_classifier.keras"