import os
import shutil
import cv2

from fastapi import UploadFile
from ultralytics import YOLOWorld
from transformers import pipeline
from PIL import Image


# =========================================================
# MODELS
# =========================================================

YOLO_MODEL_PATH = "yolov8s-world.pt"

yolo_model = YOLOWorld(YOLO_MODEL_PATH)

# Image classification model
classifier = pipeline(
    "image-classification",
    model="google/vit-base-patch16-224"
)


# =========================================================
# DIRECTORIES
# =========================================================

UPLOAD_DIR = "uploads/images"
RESULT_DIR = "uploads/results"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)


# =========================================================
# YOLO-WORLD DETECTION CLASSES
# =========================================================

ANIMAL_CLASSES = [
    # Wild animals
    "lion",
    "tiger",
    "leopard",
    "cheetah",
    "jaguar",
    "bear",
    "elephant",
    "deer",
    "giraffe",
    "zebra",
    "buffalo",
    "bison",
    "rhinoceros",
    "hippopotamus",
    "wolf",
    "fox",
    "monkey",
    "gorilla",
    "chimpanzee",
    "orangutan",
    "rabbit",
    "hare",
    "squirrel",

    # Domestic
    "cow",
    "goat",
    "sheep",
    "horse",
    "dog",
    "cat",

    # Reptiles
    "snake",
    "crocodile",
    "alligator",
    "lizard",
    "turtle",

    # Birds
    "eagle",
    "hawk",
    "owl",
    "parrot",
    "peacock",
    "flamingo",
    "penguin",
    "duck",
    "goose",
    "bird",

    # Aquatic
    "fish",
    "shark",
    "whale",
    "dolphin",
    "seal",
    "sea lion",
    "octopus",
    "squid",
    "jellyfish",
    "ray",
    "stingray",
    "crab",
    "lobster",
    "starfish",
    "seahorse",
    "tuna",
    "salmon",

    # Insects
    "butterfly",
    "bee",
    "dragonfly",
    "grasshopper",
    "beetle"
]


yolo_model.set_classes(ANIMAL_CLASSES)


# =========================================================
# RECOMMENDATIONS
# =========================================================

RECOMMENDATIONS = {

    "lion":
        "Protect grassland habitat and continue population monitoring.",

    "tiger":
        "Protect forest corridors and increase camera trap monitoring.",

    "leopard":
        "Protect forest habitat and reduce human-wildlife conflict.",

    "cheetah":
        "Protect grassland habitat and monitor population distribution.",

    "jaguar":
        "Protect forest habitat and monitor population trends.",

    "elephant":
        "Protect migration routes, water sources and forest corridors.",

    "deer":
        "Maintain forest habitat and monitor population changes.",

    "bear":
        "Protect forest habitat and reduce human disturbance.",

    "rhinoceros":
        "Increase anti-poaching monitoring and protect habitat.",

    "giraffe":
        "Protect woodland habitat and monitor population trends.",

    "zebra":
        "Maintain grassland habitat and monitor population changes.",

    "wolf":
        "Protect natural habitat and monitor population distribution.",

    "monkey":
        "Protect forest habitat and monitor population density.",

    "bird":
        "Preserve nesting habitats and continue seasonal monitoring.",

    "eagle":
        "Protect nesting areas and reduce habitat disturbance.",

    "owl":
        "Protect forest habitat and preserve nesting areas.",

    "fish":
        "Monitor water quality and maintain aquatic habitat.",

    "shark":
        "Protect marine habitat and continue population monitoring.",

    "whale":
        "Protect marine habitat and monitor migration routes.",

    "dolphin":
        "Monitor marine ecosystems and reduce water pollution.",

    "turtle":
        "Protect nesting areas and reduce habitat disturbance.",

    "octopus":
        "Protect marine habitats and monitor population changes."
}


# =========================================================
# CLEAN SPECIES NAME
# =========================================================

def clean_species_name(label: str):

    label = label.lower()

    # ImageNet labels often contain multiple names.
    # Example:
    # "lion, king of beasts, Panthera leo"

    if "," in label:
        label = label.split(",")[0].strip()

    return label.strip()


# =========================================================
# CLASSIFY ANIMAL CROP
# =========================================================

def classify_crop(crop):

    if crop is None:
        return None, 0

    if crop.size == 0:
        return None, 0

    try:

        pil_image = Image.fromarray(
            cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
        )

        predictions = classifier(
            pil_image,
            top_k=5
        )

        if not predictions:
            return None, 0

        best = predictions[0]

        species = clean_species_name(
            best["label"]
        )

        confidence = float(
            best["score"]
        )

        return species, confidence

    except Exception as e:

        print(
            "Classification error:",
            str(e)
        )

        return None, 0


# =========================================================
# IMAGE ANALYSIS
# =========================================================

def analyze_image(image: UploadFile):

    # -----------------------------------------------------
    # 1. Save image
    # -----------------------------------------------------

    filename = os.path.basename(
        image.filename
    )

    image_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(
        image_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            image.file,
            buffer
        )


    # -----------------------------------------------------
    # 2. Read image
    # -----------------------------------------------------

    original = cv2.imread(
        image_path
    )

    if original is None:

        return {
            "species": "Unknown",
            "confidence": 0,
            "count": 0,
            "habitat_score": 0,
            "biodiversity_index": 0,
            "recommendation":
                "Unable to read the uploaded image.",
            "detected_image": None
        }


    # -----------------------------------------------------
    # 3. YOLO-World detection
    # -----------------------------------------------------

    results = yolo_model.predict(
        source=image_path,
        conf=0.20,
        iou=0.45,
        verbose=False
    )


    result = results[0]

    detections = []


    # -----------------------------------------------------
    # 4. Extract bounding boxes
    # -----------------------------------------------------

    if result.boxes is not None:

        for box in result.boxes:

            confidence = float(
                box.conf[0].item()
            )

            if confidence < 0.20:
                continue

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist()
            )

            # Keep coordinates inside image
            x1 = max(0, x1)
            y1 = max(0, y1)

            x2 = min(
                original.shape[1],
                x2
            )

            y2 = min(
                original.shape[0],
                y2
            )

            if x2 <= x1 or y2 <= y1:
                continue

            crop = original[
                y1:y2,
                x1:x2
            ]

            # -------------------------------------------------
            # IMPORTANT:
            # Don't trust YOLO species label.
            # Use ViT to classify the detected animal.
            # -------------------------------------------------

            species, species_confidence = classify_crop(
                crop
            )

            if species is None:
                continue

            detections.append({
                "species": species,
                "confidence": species_confidence,
                "box": (x1, y1, x2, y2)
            })


    # -----------------------------------------------------
    # 5. Fallback
    #
    # If YOLO fails to find an animal, classify the
    # complete image.
    # -----------------------------------------------------

    if not detections:

        species, confidence = classify_crop(
            original
        )

        if species is None:

            return {
                "species": "Unknown",
                "confidence": 0,
                "count": 0,
                "habitat_score": 0,
                "biodiversity_index": 0,
                "recommendation":
                    "No supported animal was detected.",
                "detected_image": None
            }

        detections.append({
            "species": species,
            "confidence": confidence,
            "box": None
        })


    # -----------------------------------------------------
    # 6. Count species
    # -----------------------------------------------------

    species_counts = {}

    species_confidences = {}

    for detection in detections:

        species = detection["species"]

        confidence = detection["confidence"]

        species_counts[species] = (
            species_counts.get(species, 0) + 1
        )

        species_confidences.setdefault(
            species,
            []
        ).append(confidence)


    # -----------------------------------------------------
    # 7. Select dominant species
    # -----------------------------------------------------

    dominant_species = max(
        species_counts,
        key=species_counts.get
    )


    # -----------------------------------------------------
    # 8. Confidence
    # -----------------------------------------------------

    confidence = max(
        species_confidences[
            dominant_species
        ]
    )


    # -----------------------------------------------------
    # 9. Count
    # -----------------------------------------------------

    count = species_counts[
        dominant_species
    ]


    # -----------------------------------------------------
    # 10. Habitat score
    #
    # Application indicator based on classification
    # confidence. NOT a biological measurement.
    # -----------------------------------------------------

    habitat_score = round(
        confidence * 100,
        2
    )


    # -----------------------------------------------------
    # 11. Biodiversity
    # -----------------------------------------------------

    unique_species = len(
        species_counts
    )

    biodiversity_index = min(
        unique_species * 20,
        100
    )


    # -----------------------------------------------------
    # 12. Recommendation
    # -----------------------------------------------------

    recommendation = RECOMMENDATIONS.get(
        dominant_species,
        "Continue wildlife monitoring and habitat protection."
    )


    # -----------------------------------------------------
    # 13. Draw our own annotations
    #
    # We intentionally DON'T use YOLO's species names,
    # because YOLO-World may call a lion a bear.
    # -----------------------------------------------------

    annotated = original.copy()

    for detection in detections:

        species = detection["species"]

        confidence = detection["confidence"]

        box = detection["box"]

        if box is None:
            continue

        x1, y1, x2, y2 = box

        cv2.rectangle(
            annotated,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

        label = (
            f"{species} "
            f"{confidence * 100:.1f}%"
        )

        cv2.putText(
            annotated,
            label,
            (x1, max(25, y1 - 10)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )


    # -----------------------------------------------------
    # 14. Save result
    # -----------------------------------------------------

    result_image = os.path.join(
        RESULT_DIR,
        f"result_{filename}"
    )

    cv2.imwrite(
        result_image,
        annotated
    )


    # -----------------------------------------------------
    # 15. Existing API response
    # -----------------------------------------------------

    return {

        "species":
            dominant_species,

        "confidence":
            round(
                confidence * 100,
                2
            ),

        "count":
            count,

        "habitat_score":
            habitat_score,

        "biodiversity_index":
            biodiversity_index,

        "recommendation":
            recommendation,

        "detected_image":
            result_image
    }