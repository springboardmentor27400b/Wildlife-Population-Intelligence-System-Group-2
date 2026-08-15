from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data=r"D:\projects\wildlife\datasets\wildlife-yolo\data.yaml",
    epochs=20,
    imgsz=640,
    batch=8,
    workers=2,
    project="runs",
    name="wildsight_yolo"
)