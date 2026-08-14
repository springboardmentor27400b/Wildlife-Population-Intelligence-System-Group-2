import cv2
import numpy as np

def assess_image_quality(image_np: np.ndarray) -> dict:
    """
    Analyzes visual quality parameters:
    - Blur Score (Laplacian variance)
    - Low Light Detection (mean pixel intensity)
    - IR / Night Vision detection (channel variance check)
    - Resolution assessment
    - Noise estimate (standard deviation of high-frequency components)
    """
    if image_np is None or image_np.size == 0:
        return {"quality_score": 0.0, "flags": ["corrupt"]}
        
    h, w, c = image_np.shape
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    
    # 1. Blur Score (Laplacian variance)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = blur_score < 100.0
    
    # 2. Low Light Detection
    mean_intensity = float(np.mean(gray))
    is_low_light = mean_intensity < 40.0
    
    # 3. IR / Night Vision Detection (Near monochrome check)
    # Check standard deviation across channels for each pixel
    channel_diff = float(np.max(np.abs(image_np[:, :, 0].astype(float) - image_np[:, :, 1].astype(float))))
    channel_diff = max(channel_diff, float(np.max(np.abs(image_np[:, :, 1].astype(float) - image_np[:, :, 2].astype(float)))))
    is_ir = channel_diff < 8.0 # Very small difference across color channels indicates monochrome IR
    
    # 4. Noise estimation
    # Estimate standard deviation of noise using local neighborhood variance subtraction
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    noise_est = float(np.std(gray.astype(float) - blurred.astype(float)))
    is_noisy = noise_est > 15.0
    
    # 5. Low Resolution Check
    is_low_res = w < 640 or h < 480
    
    # Calculate a composite Quality Score (0 to 100)
    quality_score = 100.0
    flags = []
    
    if is_blurry:
        quality_score -= 20.0
        flags.append("blurry")
    if is_low_light:
        quality_score -= 15.0
        flags.append("low_light")
    if is_ir:
        flags.append("ir_nightvision")
    if is_noisy:
        quality_score -= 10.0
        flags.append("noisy")
    if is_low_res:
        quality_score -= 15.0
        flags.append("low_resolution")
        
    quality_score = max(0.0, min(100.0, quality_score))
    
    return {
        "quality_score": float(round(quality_score, 2)),
        "blur_score": float(round(blur_score, 2)),
        "mean_intensity": float(round(mean_intensity, 2)),
        "noise_estimate": float(round(noise_est, 2)),
        "resolution": f"{w}x{h}",
        "flags": flags
    }

def apply_adaptive_preprocessing(image_np: np.ndarray, quality_report: dict) -> np.ndarray:
    """
    Applies enhancement transformations automatically based on quality analysis:
    - Low-light/IR: CLAHE (Contrast Limited Adaptive Histogram Equalization)
    - Blurry: Unsharp masking sharpening filter
    - Noisy: Gaussian blur denoising
    """
    processed = image_np.copy()
    flags = quality_report.get("flags", [])
    
    # 1. Handle Night vision/IR or Low Light using CLAHE
    if "ir_nightvision" in flags or "low_light" in flags:
        # Convert to LAB color space
        lab = cv2.cvtColor(processed, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        # Merge back
        limg = cv2.merge((cl, a, b))
        processed = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
    # 2. Handle blurry images with unsharp mask sharpening filter
    if "blurry" in flags:
        gaussian_blur = cv2.GaussianBlur(processed, (0, 0), 2.0)
        processed = cv2.addWeighted(processed, 1.5, gaussian_blur, -0.5, 0)
        
    # 3. Handle high noise
    if "noisy" in flags:
        processed = cv2.GaussianBlur(processed, (3, 3), 0)
        
    return processed
