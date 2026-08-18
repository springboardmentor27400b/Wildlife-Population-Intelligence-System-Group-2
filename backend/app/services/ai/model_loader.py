import os
try:
    import torch
    import timm
    from ultralytics import YOLO
except ImportError:
    torch = None
    timm = None
    YOLO = None

# Globals to store loaded model references
_det_model = None
_class_model = None
_class_transforms = None
_class_labels = None
_device = None

def get_device():
    global _device
    if torch is None:
        return "cpu"
    if _device is None:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return _device

def load_models():
    """
    Loads Stage 1 and Stage 2 models once, keeping them in memory.
    """
    if torch is None or YOLO is None or timm is None:
        return
    global _det_model, _class_model, _class_transforms, _class_labels
    device = get_device()

    if _det_model is None:
        # Resolve yolov8x.pt path in a robust way
        possible_paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "yolov8x.pt")),
            os.path.abspath(os.path.join(os.getcwd(), "yolov8x.pt")),
            os.path.abspath(os.path.join(os.getcwd(), "..", "yolov8x.pt")),
            "yolov8x.pt"
        ]
        det_model_path = None
        for path in possible_paths:
            if os.path.exists(path):
                det_model_path = path
                break
        
        if not det_model_path:
            det_model_path = "yolov8x.pt"
            
        _det_model = YOLO(det_model_path)
        _det_model.to(device)

    if _class_model is None:
        class_model_name = "hf_hub:timm/vit_large_patch14_clip_336.laion2b_ft_augreg_inat21"
        _class_model = timm.create_model(class_model_name, pretrained=True)
        _class_model.to(device)
        _class_model.eval()

        # Fetch resolution, cropping, and normalization configurations for iNaturalist
        data_config = timm.data.resolve_model_data_config(_class_model)
        _class_transforms = timm.data.create_transform(**data_config, is_training=False)
        _class_labels = _class_model.default_cfg.get("label_names", None)

def get_detection_model():
    global _det_model
    if _det_model is None:
        load_models()
    return _det_model

def get_classification_model():
    global _class_model
    if _class_model is None:
        load_models()
    return _class_model

def get_classification_transforms():
    global _class_transforms
    if _class_transforms is None:
        load_models()
    return _class_transforms

def get_classification_labels():
    global _class_labels
    if _class_labels is None:
        load_models()
    return _class_labels

def get_speciesnet_model():
    from app.services.ai.speciesnet_service import get_speciesnet_model as _get_speciesnet
    return _get_speciesnet()

