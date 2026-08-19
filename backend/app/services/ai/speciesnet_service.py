import os
import logging

logger = logging.getLogger(__name__)

import tempfile

from app.services.ai.gcs_model_sync import ensure_model_directory, get_gcs_config

# Ensure cache directories reside safely in temporary/writable location
cfg = get_gcs_config()
CACHE_DIR = cfg["local_cache_dir"] or os.path.join(tempfile.gettempdir(), ".cache", "speciesnet")
try:
    os.makedirs(CACHE_DIR, exist_ok=True)
except Exception:
    pass

os.environ["KAGGLEHUB_CACHE"] = CACHE_DIR
os.environ["HF_HOME"] = CACHE_DIR
os.environ["TORCH_HOME"] = CACHE_DIR

_speciesnet_model = None

def get_speciesnet_model():
    """
    Singleton loader for Google SpeciesNet (v4.0.2a) model.
    Production fallback classifier when ViT confidence < 80%.
    1. Checks local cache / GCS prepared mirror.
    2. Falls back to KaggleHub automatic download.
    """
    global _speciesnet_model
    if _speciesnet_model is None:
        try:
            logger.info("Initializing Google SpeciesNet (v4.0.2a) fallback model...")
            from speciesnet import SpeciesNet

            # Check if GCS-synced local mirror exists or can be downloaded
            speciesnet_local_dir = os.path.join(CACHE_DIR, "speciesnet_v4_0_2a")
            model_target = "kaggle:google/speciesnet/pyTorch/v4.0.2a/1"

            # Attempt GCS sync if configured
            synced_dir = ensure_model_directory("speciesnet/v4.0.2a", speciesnet_local_dir)
            if synced_dir and os.path.exists(synced_dir) and os.listdir(synced_dir):
                logger.info(f"[SpeciesNet] Using GCS-prepared local model directory: {synced_dir}")
                model_target = synced_dir
            else:
                logger.info(f"[SpeciesNet] Using upstream KaggleHub source: {model_target}")

            _speciesnet_model = SpeciesNet(
                model_target,
                components="all",
                geofence=False
            )
            logger.info("Google SpeciesNet model initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Google SpeciesNet model: {e}", exc_info=True)
            _speciesnet_model = None
    return _speciesnet_model


def parse_speciesnet_class(class_str: str) -> str:
    """
    Parses SpeciesNet formatted taxonomy string:
    'uuid;class;order;family;genus;species;common_name'
    Returns human-readable species name.
    """
    if not class_str:
        return "Unknown Species"
    
    parts = class_str.split(";")
    # Try common_name (last part)
    if len(parts) >= 7 and parts[-1].strip():
        return parts[-1].strip().title()
    # Try genus + species
    if len(parts) >= 6 and parts[4].strip() and parts[5].strip():
        return f"{parts[4].strip()} {parts[5].strip()}".title()
    # Try family / order / class
    for p in reversed(parts):
        if p.strip() and len(p.strip()) > 1:
            return p.strip().title()
            
    return class_str.title()


def predict_crop_species(crop_input: str) -> dict | None:
    """
    Runs Google SpeciesNet classification on an animal crop image path.
    Returns {"species": str, "confidence": float} or None on failure.
    """
    model = get_speciesnet_model()
    if model is None:
        logger.warning("SpeciesNet model is unavailable; bypassing fallback classification.")
        return None

    if not os.path.exists(crop_input):
        logger.warning(f"Crop image file not found for SpeciesNet: {crop_input}")
        return None

    try:
        results = model.predict(filepaths=[crop_input])
        if not results or "predictions" not in results or not results["predictions"]:
            return None

        pred_data = results["predictions"][0]
        
        # Check top classification from classifications object if available
        classifications = pred_data.get("classifications", {})
        classes = classifications.get("classes", [])
        scores = classifications.get("scores", [])

        if classes and scores:
            top_class_raw = classes[0]
            top_score = float(scores[0])
            species_name = parse_speciesnet_class(top_class_raw)
            top5 = []
            for cls_str, score in zip(classes[:5], scores[:5]):
                top5.append({
                    "species": parse_speciesnet_class(cls_str),
                    "confidence": float(score)
                })
            return {
                "species": species_name,
                "confidence": top_score,
                "raw_class": top_class_raw,
                "top5_predictions": top5
            }

        # Fallback to top-level prediction object if classification list is empty
        top_pred_raw = pred_data.get("prediction", "")
        top_score = float(pred_data.get("prediction_score", 0.0))
        if top_pred_raw:
            species_name = parse_speciesnet_class(top_pred_raw)
            return {
                "species": species_name,
                "confidence": top_score,
                "raw_class": top_pred_raw,
                "top5_predictions": [{"species": species_name, "confidence": top_score}]
            }

        return None

    except Exception as e:
        logger.error(f"Error during SpeciesNet crop classification inference: {e}", exc_info=True)
        return None
