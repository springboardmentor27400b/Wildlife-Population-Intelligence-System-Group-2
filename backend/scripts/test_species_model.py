from pathlib import Path
import json

import numpy as np
import tensorflow as tf


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

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

IMAGE_DIR = (
    BASE_DIR
    / "datasets"
    / "species_identification"
    / "images"
)


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 60)
print("TESTING SPECIES CLASSIFICATION MODEL")
print("=" * 60)

print()
print("Loading model...")

model = tf.keras.models.load_model(
    MODEL_FILE
)

print("Model loaded successfully.")


# ============================================================
# LOAD CLASSES
# ============================================================

with open(
    CLASSES_FILE,
    "r",
    encoding="utf-8",
) as f:

    class_data = json.load(f)


classes = {
    int(index): species
    for index, species in class_data.items()
}


print()
print("Classes:")

for index in sorted(classes):
    print(
        f"{index}: {classes[index]}"
    )


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_image(image_path):

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

    print()
    print("-" * 60)
    print(f"IMAGE: {image_path.name}")
    print("-" * 60)

    for rank, index in enumerate(
        top_indices,
        start=1,
    ):

        species = classes[int(index)]

        confidence = (
            float(predictions[index])
            * 100
        )

        print(
            f"{rank}. "
            f"{species:20s} "
            f"{confidence:6.2f}%"
        )

    best_index = int(
        top_indices[0]
    )

    best_species = classes[
        best_index
    ]

    best_confidence = (
        float(predictions[best_index])
        * 100
    )

    print()
    print(
        f"FINAL PREDICTION: "
        f"{best_species}"
    )

    print(
        f"CONFIDENCE: "
        f"{best_confidence:.2f}%"
    )


# ============================================================
# SELECT TEST IMAGES
# ============================================================

images = sorted(
    p
    for p in IMAGE_DIR.iterdir()
    if p.suffix.lower()
    in {".jpg", ".jpeg"}
)


print()
print(
    f"Images available: "
    f"{len(images):,}"
)


# Test first 10 images
test_images = images[:10]


print(
    f"Testing {len(test_images)} images..."
)


for image_path in test_images:

    predict_image(
        image_path
    )


print()
print("=" * 60)
print("TEST COMPLETE")
print("=" * 60)