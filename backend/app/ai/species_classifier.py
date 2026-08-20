from pathlib import Path
import json

import numpy as np
import tensorflow as tf


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_FILE = (
    BASE_DIR
    / "ai_models"
    / "species_classifier"
    / "best_species_classifier.keras"
)

CLASSES_FILE = (
    BASE_DIR
    / "ai_models"
    / "species_classifier"
    / "classes.json"
)


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading wildlife species classifier...")

model = tf.keras.models.load_model(
    MODEL_FILE
)

print("Species classifier loaded successfully.")


# ============================================================
# LOAD CLASSES
# ============================================================

with open(
    CLASSES_FILE,
    "r",
    encoding="utf-8",
) as file:

    class_data = json.load(file)


classes = {
    int(index): species
    for index, species in class_data.items()
}


# ============================================================
# PREDICTION
# ============================================================

def classify_species(image_path: str):

    image = tf.keras.utils.load_img(
        image_path,
        target_size=(224, 224),
    )

    image_array = tf.keras.utils.img_to_array(
        image
    )

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )

    predictions = model.predict(
        image_array,
        verbose=0,
    )[0]

    top_indices = np.argsort(
        predictions
    )[::-1][:5]

    top_predictions = []

    for index in top_indices:

        top_predictions.append({
            "species": classes[int(index)],
            "confidence": round(
                float(predictions[index]),
                4,
            ),
        })

    best_index = int(top_indices[0])

    return {
        "species": classes[best_index],
        "confidence": round(
            float(predictions[best_index]),
            4,
        ),
        "predictions": top_predictions,
    }