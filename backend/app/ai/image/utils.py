import cv2
import numpy as np
from typing import List, Dict, Any

def draw_bounding_boxes(image_path: str, detections: List[Dict[str, Any]], output_path: str):
    """
    Draws green bounding boxes and label badges on the image, checking borders.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not decode image file using OpenCV")
        
    h, w, c = img.shape
    annotated_img = img.copy()
    
    for i, det in enumerate(detections):
        x1, y1, x2, y2 = map(int, det["box"])
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)
        
        # Draw bounding box
        cv2.rectangle(annotated_img, (x1, y1), (x2, y2), (0, 255, 0), 3)
        
        species_label = det["species"]
        conf_val = det["confidence"]
        label_text = f"{species_label} {conf_val:.2%}"
        
        # Calculate text size for badge background
        (text_w, text_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
        
        # Draw badge label inside box if near upper boundary
        label_y = y1 - 8 if y1 - text_h - 12 > 0 else y1 + text_h + 8
        
        # Filled green background badge
        cv2.rectangle(
            annotated_img, 
            (x1, label_y - text_h - 4), 
            (x1 + text_w + 4, label_y + baseline), 
            (0, 255, 0), 
            -1
        )
        
        # Text in black over green badge
        cv2.putText(
            annotated_img, 
            label_text, 
            (x1 + 2, label_y - 2),
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.55, 
            (0, 0, 0), 
            2
        )
        
    cv2.imwrite(output_path, annotated_img)
