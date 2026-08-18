import os
try:
    import cv2
except ImportError:
    cv2 = None
import numpy as np

from PIL import Image

def analyze_image_quality(image_path: str) -> dict:
    """
    Performs image quality analysis:
    1. Blur Detection (Laplacian Variance)
    2. Brightness Detection (Average Grayscale Intensity)
    3. Resolution Check (640x640 minimum target)
    4. Noise Estimation (Immerkær fast noise variance estimation)
    5. Contrast Check (Grayscale intensity standard deviation)
    6. Overall weighted Quality Score (Blur 40%, Resolution 25%, Brightness 15%, Contrast 10%, Noise 10%)
    """
    if not os.path.exists(image_path):
        raise ValueError(f"Image file does not exist: {image_path}")

    if cv2 is not None:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Image file could not be loaded for quality analysis.")
        h, w, _ = img.shape
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    else:
        try:
            with Image.open(image_path) as pil_img:
                rgb_img = pil_img.convert("RGB")
                w, h = rgb_img.size
                arr = np.array(rgb_img, dtype=np.float64)
                gray = arr[:, :, 0] * 0.299 + arr[:, :, 1] * 0.587 + arr[:, :, 2] * 0.114
                if w >= 3 and h >= 3:
                    gy, gx = np.gradient(gray)
                    laplacian_var = float(np.var(gx) + np.var(gy)) * 100.0
                else:
                    laplacian_var = 100.0
        except Exception as e:
            raise ValueError(f"Image file could not be loaded for quality analysis: {e}")

    # 1. Blur Detection (Laplacian Variance)
    if laplacian_var > 150:
        blur_status = "Good"
        blur_score = 100.0
    elif 80 <= laplacian_var <= 150:
        blur_status = "Acceptable"
        # Linear interpolation between 80 (60 score) and 150 (100 score)
        blur_score = 60.0 + (laplacian_var - 80.0) * (40.0 / 70.0)
    else:
        blur_status = "Blurry"
        # Linear interpolation between 0 and 80 (60 score)
        blur_score = (laplacian_var / 80.0) * 60.0
    blur_score = float(np.clip(blur_score, 0.0, 100.0))

    # 2. Brightness Detection (Average Grayscale Intensity)
    mean_brightness = float(gray.mean())
    if mean_brightness < 40:
        brightness_status = "Too Dark"
        brightness_score = (mean_brightness / 40.0) * 100.0
    elif 40 <= mean_brightness <= 180:
        brightness_status = "Good"
        brightness_score = 100.0
    elif 180 < mean_brightness <= 220:
        brightness_status = "Acceptable"
        # Linear interpolation from 180 (100 score) to 220 (80 score)
        brightness_score = 100.0 - (mean_brightness - 180.0) * (20.0 / 40.0)
    else:
        brightness_status = "Overexposed"
        # Linear interpolation from 220 (80 score) to 255 (0 score)
        brightness_score = 80.0 - (mean_brightness - 220.0) * (80.0 / 35.0)
    brightness_score = float(np.clip(brightness_score, 0.0, 100.0))

    # 3. Resolution Check
    resolution_status = "Acceptable" if (w >= 640 and h >= 640) else "Too Low"
    if resolution_status == "Acceptable":
        resolution_score = 100.0
    else:
        # Score based on minimum of width and height scaled to 640
        min_dim = min(w, h)
        resolution_score = (min_dim / 640.0) * 80.0
    resolution_score = float(np.clip(resolution_score, 0.0, 100.0))

    # 4. Noise Estimation (Immerkær method: fast noise estimation)
    if w > 2 and h > 2:
        if cv2 is not None:
            kernel = np.array([[1, -2, 1],
                               [-2, 4, -2],
                               [1, -2, 1]], dtype=np.float64)
            laplacian_img = cv2.filter2D(gray.astype(np.float64), -1, kernel)
        else:
            laplacian_img = (
                gray[:-2, :-2] * 1.0 + gray[:-2, 1:-1] * -2.0 + gray[:-2, 2:] * 1.0 +
                gray[1:-1, :-2] * -2.0 + gray[1:-1, 1:-1] * 4.0 + gray[1:-1, 2:] * -2.0 +
                gray[2:, :-2] * 1.0 + gray[2:, 1:-1] * -2.0 + gray[2:, 2:] * 1.0
            )
        sigma = float(np.sum(np.abs(laplacian_img)))
        sigma = sigma * np.sqrt(0.5 * np.pi) / (6.0 * (w - 2) * (h - 2))
    else:
        sigma = 0.0

    if sigma < 3.0:
        noise_status = "Low"
        noise_score = 100.0
    elif 3.0 <= sigma <= 10.0:
        noise_status = "Moderate"
        # Linear interpolation from 3.0 (100 score) to 10.0 (50 score)
        noise_score = 100.0 - (sigma - 3.0) * (50.0 / 7.0)
    else:
        noise_status = "High"
        # Linear interpolation from 10.0 (50 score) to 35.0 (0 score)
        noise_score = 50.0 - (sigma - 10.0) * (50.0 / 25.0)
    noise_score = float(np.clip(noise_score, 0.0, 100.0))

    # 5. Contrast Check (Grayscale intensity standard deviation)
    contrast_val = float(gray.std())
    if 35 <= contrast_val <= 80:
        contrast_status = "Normal"
        contrast_score = 100.0
    elif contrast_val < 35:
        contrast_status = "Low"
        contrast_score = (contrast_val / 35.0) * 100.0
    else:
        contrast_status = "High"
        # High contrast decreases score slowly
        contrast_score = 100.0 - (contrast_val - 80.0) * (30.0 / 47.5) # from 80 (100) to 127.5 (70)
    contrast_score = float(np.clip(contrast_score, 0.0, 100.0))

    # 6. Overall Quality Score
    overall_score = (
        blur_score * 0.40 +
        resolution_score * 0.25 +
        brightness_score * 0.15 +
        contrast_score * 0.10 +
        noise_score * 0.10
    )
    overall_score = float(np.clip(overall_score, 0.0, 100.0))

    # Overall Rating: Excellent, Good, Acceptable, Poor
    if overall_score >= 85:
        overall_rating = "Excellent"
    elif overall_score >= 70:
        overall_rating = "Good"
    elif overall_score >= 50:
        overall_rating = "Acceptable"
    else:
        overall_rating = "Poor"

    warning_message = None
    if overall_rating == "Poor":
        warning_message = "Low image quality may reduce prediction accuracy."

    return {
        "overall_score": round(overall_score, 1),
        "overall_rating": overall_rating,
        "blur_score": round(blur_score, 1),
        "blur_status": blur_status,
        "brightness_value": round(mean_brightness, 1),
        "brightness_status": brightness_status,
        "resolution": f"{w}x{h}",
        "resolution_status": resolution_status,
        "contrast_status": contrast_status,
        "noise_status": noise_status,
        "warning_message": warning_message
    }
