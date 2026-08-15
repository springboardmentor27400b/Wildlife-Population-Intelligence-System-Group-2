import json
from pathlib import Path
import numpy as np

from app.model_loader import load_model
from app.preprocess import preprocess_image

BASE_DIR = Path(__file__).resolve().parent.parent

with open(BASE_DIR / "models" / "class_names.json") as file:
    CLASS_NAMES = json.load(file)

def predict_species(image_path):

    model = load_model()

    image = preprocess_image(image_path)

    prediction = model.predict(image, verbose=0)

    predicted_index = np.argmax(prediction)

    confidence = float(np.max(prediction) * 100)

    species = CLASS_NAMES[predicted_index]

    return {
        "species": species,
        "confidence": round(confidence, 2)
    }