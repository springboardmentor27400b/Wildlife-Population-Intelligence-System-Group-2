from ultralytics import YOLO
import os

# Load model only once
model = YOLO("runs/detect/train/weights/best.pt")


def detect_image(image_path):
    """
    Run object detection on an image.
    """

    results = model(image_path)

    detections = []

    for result in results:

        for box in result.boxes:

            cls = int(box.cls)

            confidence = float(box.conf)

            detections.append({
                "species": model.names[cls],
                "confidence": round(confidence * 100, 2)
            })

    return detections