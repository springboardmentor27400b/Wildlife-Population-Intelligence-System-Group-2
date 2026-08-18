import os
import logging
import base64
import requests
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
MODEL_ID = "endangered-species-jal0m"
MODEL_VERSION = 3
ROBOFLOW_URL = f"https://detect.roboflow.com/{MODEL_ID}/{MODEL_VERSION}"
CONFIDENCE_THRESHOLD = 0.60  # Only detect as endangered if confidence > 60% (0.60)


def predict_endangered_species(image_path: str) -> dict:
    """
    Executes Roboflow Endangered Species Detection model on the given image.
    Model: endangered-species-jal0m/3

    Applies a strict confidence threshold of > 60% (0.60).
    If detection confidence is > 60%, flags as endangered species.
    Otherwise, reports that no endangered species detected.

    Returns a unified response dictionary:
    {
        "detected": bool,
        "species_name": str or None,
        "confidence": float,
        "predictions": list,
        "message": str,
        "error": str or None
    }
    """
    default_response = {
        "detected": False,
        "species_name": None,
        "confidence": 0.0,
        "predictions": [],
        "message": "No endangered species detected.",
        "error": None,
    }

    # 1. Retrieve API key
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key:
        try:
            from app.core.config import settings

            api_key = settings.ROBOFLOW_API_KEY
        except Exception:
            pass

    if not api_key or api_key.strip() == "" or api_key == "YOUR_API_KEY":
        msg = "ROBOFLOW_API_KEY is missing or not set in .env file."
        logger.warning(msg)
        default_response["error"] = msg
        return default_response

    if not os.path.exists(image_path):
        msg = f"Image file not found: {image_path}"
        logger.error(msg)
        default_response["error"] = msg
        return default_response

    # 2. Try running inference using Roboflow Python SDK or direct REST API
    try:
        # Attempt direct HTTP request to Roboflow Hosted API (lightweight, zero-dep issues)
        with open(image_path, "rb") as image_file:
            img_bytes = image_file.read()
            base64_image = base64.b64encode(img_bytes).decode("utf-8")

        # Pass confidence=60 (percent) to Roboflow API to filter predictions on server side
        params = {
            "api_key": api_key.strip(),
            "confidence": 60
        }

        # Send image via POST request
        response = requests.post(
            ROBOFLOW_URL,
            params=params,
            data=base64_image,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10,
        )

        if response.status_code != 200:
            err_msg = f"Roboflow API returned status code {response.status_code}: {response.text}"
            logger.error(err_msg)
            default_response["error"] = f"Roboflow API error ({response.status_code})"
            return default_response

        res_data = response.json()
        raw_predictions = res_data.get("predictions", [])

        if not raw_predictions:
            default_response["detected"] = False
            default_response["species_name"] = None
            default_response["confidence"] = 0.0
            default_response["predictions"] = []
            default_response["message"] = "No endangered species detected."
            return default_response

        # Process predictions and enforce strict confidence > 60% threshold
        processed_preds = []
        best_pred = None
        max_conf = -1.0

        for pred in raw_predictions:
            raw_conf = float(pred.get("confidence", 0.0))
            # Normalize confidence to decimal [0.0, 1.0] if Roboflow returns percentage > 1.0
            conf = raw_conf / 100.0 if raw_conf > 1.0 else raw_conf

            # Strict threshold check: MUST be strictly greater than 60% (0.60)
            if conf <= CONFIDENCE_THRESHOLD:
                continue

            class_name = pred.get("class", "Unknown Endangered Species")

            pred_item = {
                "class": class_name,
                "confidence": conf,
            }
            processed_preds.append(pred_item)

            if conf > max_conf:
                max_conf = conf
                best_pred = pred_item

        # Final decision based on filtered predictions (> 60% confidence)
        if processed_preds and best_pred:
            default_response["detected"] = True
            default_response["species_name"] = best_pred["class"]
            default_response["confidence"] = best_pred["confidence"]
            default_response["predictions"] = processed_preds
            default_response["message"] = f"Endangered species detected: {best_pred['class']} ({best_pred['confidence'] * 100:.1f}% confidence)"
        else:
            default_response["detected"] = False
            default_response["species_name"] = None
            default_response["confidence"] = 0.0
            default_response["predictions"] = []
            default_response["message"] = "No endangered species detected (confidence <= 60%)."

        return default_response

    except Exception as e:
        err_msg = f"Exception during Endangered Species Roboflow inference: {str(e)}"
        logger.error(err_msg, exc_info=True)
        default_response["error"] = str(e)
        return default_response
