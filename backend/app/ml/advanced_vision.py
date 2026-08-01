import cv2
import numpy as np
import random
from typing import Dict, Any, Tuple

def analyze_image_quality(image_path: str) -> Tuple[str, Dict[str, Any]]:
    """
    Evaluates image quality using OpenCV (blur, brightness, contrast)
    Returns: (Quality Grade, Metrics Dict)
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image for quality assessment")
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur Detection (Laplacian Variance)
        # Higher variance = sharper image. Threshold is typically ~100.
        blur_variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # 2. Brightness (Average pixel intensity)
        brightness = np.mean(gray)
        
        # 3. Contrast (RMS Contrast - standard deviation of pixel intensities)
        contrast = np.std(gray)
        
        # 4. Noise Estimation (Difference between image and median blurred version)
        median = cv2.medianBlur(gray, 3)
        noise = np.std(cv2.subtract(gray, median))
        
        # 5. Resolution
        h, w = img.shape[:2]
        resolution_score = (h * w) / (1920 * 1080) * 100 # percentage of 1080p
        
        # Grading Logic
        score = 0
        if blur_variance > 500: score += 3
        elif blur_variance > 100: score += 2
        elif blur_variance > 50: score += 1
        
        if 80 < brightness < 200: score += 2
        elif 40 < brightness < 220: score += 1
        
        if contrast > 50: score += 2
        elif contrast > 25: score += 1
        
        if noise < 10: score += 2
        elif noise < 20: score += 1
        
        if resolution_score > 80: score += 2
        elif resolution_score > 30: score += 1
        
        grade = "Poor"
        if score >= 7: grade = "Excellent"
        elif score >= 5: grade = "Good"
        elif score >= 3: grade = "Fair"
        
        metrics = {
            "blur_variance": round(blur_variance, 2),
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "noise": round(noise, 2),
            "resolution_pct": round(resolution_score, 2),
            "total_score": score
        }
        
        return grade, metrics
        
    except Exception as e:
        return "Unknown", {"error": str(e)}


def detect_animals_and_behaviors(image_path: str, base_species: str, base_confidence: float) -> Tuple[int, list, str]:
    """
    Mock Object Detection Algorithm.
    Since we only have an Image Classification model (predicts 1 class for whole image), 
    this simulates object detection by generating 1-3 bounding boxes.
    Returns: (animal_count, detections_list, detection_source)
    """
    # Deterministic randomness based on image name to ensure consistency 
    # across multiple calls if needed, but here we just use random
    random.seed(image_path + base_species)
    
    # 70% chance of 1 animal, 20% chance of 2, 10% chance of 3
    rand_val = random.random()
    if rand_val > 0.9:
        animal_count = 3
    elif rand_val > 0.7:
        animal_count = 2
    else:
        animal_count = 1
        
    behaviors_map = {
        "Tiger": ["Walking", "Standing", "Resting"],
        "Elephant": ["Walking", "Feeding", "Standing"],
        "Bird": ["Flying", "Resting", "Feeding"],
        "Monkey": ["Resting", "Feeding", "Running"],
    }
    
    possible_behaviors = behaviors_map.get(base_species, ["Standing", "Walking", "Running", "Feeding", "Resting", "Unknown"])
    
    detections = []
    
    # Simple algorithm to generate non-overlapping (mostly) bounding boxes
    # Coordinates are percentages (0-100)
    for i in range(animal_count):
        # Base confidence varies slightly for multiple detections
        conf = max(0.0, min(100.0, base_confidence + random.uniform(-10.0, 5.0)))
        
        # Generate bounding box
        box_w = random.uniform(15.0, 45.0)
        box_h = random.uniform(15.0, 60.0)
        
        x_min = random.uniform(5.0, 100.0 - box_w - 5.0)
        y_min = random.uniform(5.0, 100.0 - box_h - 5.0)
        x_max = x_min + box_w
        y_max = y_min + box_h
        
        behavior = random.choice(possible_behaviors)
        
        detections.append({
            "species": base_species,
            "confidence": round(conf, 2),
            "bbox": [round(x_min, 2), round(y_min, 2), round(x_max, 2), round(y_max, 2)],
            "behaviour": behavior
        })
        
    return animal_count, detections, "Simulation"
