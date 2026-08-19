import os
try:
    import torch
    import timm
    from ultralytics import YOLO
except ImportError:
    torch = None
    timm = None
    YOLO = None

import logging
from app.services.ai.gcs_model_sync import ensure_model_file, get_gcs_config

logger = logging.getLogger("model_loader")

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
        cfg = get_gcs_config()
        cache_dir = cfg["local_cache_dir"] or os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
        gcs_target_path = os.path.join(cache_dir, "yolov8x.pt")

        possible_paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "yolov8x.pt")),
            os.path.abspath(os.path.join(os.getcwd(), "yolov8x.pt")),
            os.path.abspath(os.path.join(os.getcwd(), "..", "yolov8x.pt")),
            gcs_target_path,
            "yolov8x.pt"
        ]
        det_model_path = None
        for path in possible_paths:
            if os.path.exists(path) and os.path.isfile(path) and os.path.getsize(path) > 1000:
                det_model_path = path
                logger.info(f"[Model Loader] Found YOLOv8x locally at: {det_model_path}")
                break

        # If not found locally, attempt sync from Google Cloud Storage
        if not det_model_path:
            logger.info("[Model Loader] YOLOv8x not found locally. Attempting GCS sync...")
            synced_path = ensure_model_file("yolov8x.pt", gcs_target_path, min_bytes=1000000)
            if synced_path and os.path.exists(synced_path):
                det_model_path = synced_path
                logger.info(f"[Model Loader] Loaded YOLOv8x from GCS sync: {det_model_path}")
            else:
                logger.info("[Model Loader] GCS sync not available or skipped for YOLOv8x; falling back to default/upstream loader.")
                det_model_path = "yolov8x.pt"

        try:
            _det_model = YOLO(det_model_path)
            _det_model.to(device)
            logger.info(f"[Model Loader] YOLOv8x initialized successfully on {device}.")
        except Exception as e:
            logger.error(f"[Model Loader] Failed to initialize YOLOv8x from {det_model_path}: {e}")
            raise

    if _class_model is None:
        class_model_name = "hf_hub:timm/vit_large_patch14_clip_336.laion2b_ft_augreg_inat21"
        try:
            logger.info(f"[Model Loader] Loading ViT iNaturalist classifier ({class_model_name})...")
            _class_model = timm.create_model(class_model_name, pretrained=True)
            _class_model.to(device)
            _class_model.eval()

            # Fetch resolution, cropping, and normalization configurations for iNaturalist
            data_config = timm.data.resolve_model_data_config(_class_model)
            _class_transforms = timm.data.create_transform(**data_config, is_training=False)
            _class_labels = (
                getattr(_class_model, "pretrained_cfg", {}).get("label_names")
                or getattr(_class_model, "default_cfg", {}).get("label_names")
            )
            if not _class_labels:
                try:
                    cfg = timm.models.get_pretrained_cfg(class_model_name)
                    _class_labels = getattr(cfg, "label_names", None) or (cfg.to_dict().get("label_names") if hasattr(cfg, "to_dict") else None)
                except Exception as e_cfg:
                    logger.warning(f"[Model Loader] Failed to fetch pretrained_cfg for {class_model_name}: {e_cfg}")
            logger.info(f"[Model Loader] ViT iNaturalist classifier initialized successfully with {len(_class_labels) if _class_labels else 0} labels.")
        except Exception as e:
            logger.warning(f"[Model Loader] ViT iNaturalist failed to load from hub ({e}); initializing fallback architecture for SpeciesNet pipeline...")
            try:
                _class_model = timm.create_model("vit_base_patch16_224", pretrained=False)
                _class_model.to(device)
                _class_model.eval()
                data_config = timm.data.resolve_model_data_config(_class_model)
                _class_transforms = timm.data.create_transform(**data_config, is_training=False)
                _class_labels = None
            except Exception as e2:
                logger.error(f"[Model Loader] Fallback ViT model initialization failed: {e2}")

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

