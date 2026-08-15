import os
import cv2
from pathlib import Path

# ---------------------------------------------------------
# FORCE CPU BEFORE IMPORTING ULTRALYTICS
# ---------------------------------------------------------

os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

from ultralytics import YOLO


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

MODEL_PATH = "/app/models/yolo/best.pt"

ANNOTATED_FOLDER = Path("/app/uploads/annotated")

ANNOTATED_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ---------------------------------------------------------
# LOAD YOLO
# ---------------------------------------------------------

print("====================================")
print("WILDSIGHT YOLO DETECTOR")
print("====================================")
print("Model:", MODEL_PATH)
print("Device: CPU")


model = YOLO(MODEL_PATH)


print("YOLO MODEL LOADED")
print("Classes:", model.names)
print("====================================")


# ---------------------------------------------------------
# DETECT ANIMALS
# ---------------------------------------------------------

def detect_animals(image_path):

    print("====================================")
    print("STARTING YOLO DETECTION")
    print("Image:", image_path)
    print("====================================")

    image_path = str(image_path)

    # -----------------------------------------------------
    # READ IMAGE
    # -----------------------------------------------------

    image = cv2.imread(image_path)

    if image is None:

        raise RuntimeError(
            f"Unable to read image: {image_path}"
        )

    print(
        "Image loaded:",
        image.shape
    )


    # -----------------------------------------------------
    # YOLO INFERENCE
    # -----------------------------------------------------

    print("Running YOLO...")

    results = model.predict(

        source=image_path,

        conf=0.10,

        device="cpu",

        workers=0,

        verbose=False

    )


    print("YOLO inference completed")


    detections = []


    # -----------------------------------------------------
    # PROCESS RESULTS
    # -----------------------------------------------------

    for result in results:

        print(
            "YOLO boxes:",
            len(result.boxes)
        )


        for box in result.boxes:

            # ---------------------------------------------
            # BOUNDING BOX
            # ---------------------------------------------

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist()
            )


            # ---------------------------------------------
            # CONFIDENCE
            # ---------------------------------------------

            confidence = float(
                box.conf[0]
            )


            # ---------------------------------------------
            # CLASS
            # ---------------------------------------------

            class_id = int(
                box.cls[0]
            )


            species = result.names.get(
                class_id,
                "Unknown"
            )


            print("------------------------------------")
            print("Detected:", species)
            print("Confidence:", confidence)
            print(
                "Bounding Box:",
                x1,
                y1,
                x2,
                y2
            )
            print("------------------------------------")


            # ---------------------------------------------
            # DRAW BOX
            # ---------------------------------------------

            cv2.rectangle(

                image,

                (x1, y1),

                (x2, y2),

                (0, 255, 0),

                2

            )


            # ---------------------------------------------
            # LABEL
            # ---------------------------------------------

            label = (
                f"{species} "
                f"{confidence * 100:.1f}%"
            )


            text_y = max(
                y1 - 10,
                20
            )


            cv2.putText(

                image,

                label,

                (x1, text_y),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.7,

                (0, 255, 0),

                2

            )


            # ---------------------------------------------
            # STORE RESULT
            # ---------------------------------------------

            detections.append({

                "species": species,

                "confidence": confidence * 100,

                "boundingBox": [

                    x1,
                    y1,
                    x2,
                    y2

                ],

                # Keep these fields so the
                # Spring Boot DTO does not break.

                "animalId": None,

                "existingAnimal": False,

                "similarity": 0.0,

                "behavior": "Unknown",

                "possibleBehaviors": [],

                "endangered": False,

                "speciesStatus": "Unknown",

                "category": "Unknown",

                "protectionLevel": "Unknown",

                "scientificName": None,

                "kingdom": "Animalia",

                "phylum": None,

                "class": None,

                "order": None,

                "family": None,

                "genus": None

            })


    # -----------------------------------------------------
    # SAVE ANNOTATED IMAGE
    # -----------------------------------------------------

    output_file = (
        "annotated_"
        + Path(image_path).name
    )


    output_path = (
        ANNOTATED_FOLDER
        / output_file
    )


    success = cv2.imwrite(

        str(output_path),

        image

    )


    if not success:

        raise RuntimeError(
            "Failed to save annotated image"
        )


    print(
        "Annotated image saved:",
        output_path
    )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    result = {

        "animalCount":
            len(detections),

        "annotatedImage":
            f"/uploads/annotated/{output_file}",

        "detections":
            detections,

        "model":
            "WildSight YOLO"

    }


    print("====================================")
    print("YOLO DETECTION FINISHED")
    print("Animals:", len(detections))
    print("====================================")


    return result