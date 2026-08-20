from ultralytics import YOLO
import os

# Load YOLO model (downloads automatically first time)
model = YOLO("yolov8n.pt")


def analyze_image(image_path):
    """
    Analyze uploaded wildlife image
    """

    results = model(image_path)

    detections = []

    animal_count = 0

    species = []

    confidence = []

    # Folder to save result images
    result_folder = "uploads/results"
    os.makedirs(result_folder, exist_ok=True)

    annotated_path = os.path.join(
        result_folder,
        os.path.basename(image_path)
    )

    # Save annotated image
    results[0].save(filename=annotated_path)

    for box in results[0].boxes:

        cls = int(box.cls[0])

        name = model.names[cls]

        conf = float(box.conf[0])

        detections.append({
            "species": name,
            "confidence": round(conf * 100, 2)
        })

        species.append(name)

        confidence.append(round(conf * 100, 2))

        animal_count += 1

    return {
        "animal_count": animal_count,
        "detections": detections,
        "annotated_image": annotated_path
    }