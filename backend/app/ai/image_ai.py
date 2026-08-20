from ultralytics import YOLO

# Load the YOLO model only once when the server starts
model = YOLO("yolov8n.pt")


def detect_animals(image_path: str):
    """
    Run YOLOv8 detection on the uploaded image.
    """

    results = model(image_path)

    detections = []

    for result in results:
        for box in result.boxes:
            cls = int(box.cls[0])
            confidence = float(box.conf[0])

            detections.append({
                "species": model.names[cls],
                "confidence": round(confidence, 2),
                "bbox": [
                    float(box.xyxy[0][0]),
                    float(box.xyxy[0][1]),
                    float(box.xyxy[0][2]),
                    float(box.xyxy[0][3]),
                ]
            })

    return detections