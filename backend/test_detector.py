from app.ai.detector import detect_objects

image_path = "uploads/images/test.jpg"

detections = detect_objects(image_path)

print(detections)