import os
from pathlib import Path
import cv2
import numpy as np


def create_sample_images():
    output_dir = Path(__file__).resolve().parents[2] / "sample_images"
    output_dir.mkdir(parents=True, exist_ok=True)

    samples = [
        ("elephant_sample.jpg", "African Elephant", (70, 70, 70), "Savanna Grassland"),
        ("tiger_sample.jpg", "Bengal Tiger", (0, 140, 255), "Tropical Forest"),
        ("zebra_sample.jpg", "Plains Zebra", (240, 240, 240), "Grassy Savanna"),
        ("rhino_sample.jpg", "White Rhinoceros", (120, 120, 120), "Open Woodland"),
        ("wolf_sample.jpg", "Gray Wolf", (100, 110, 120), "Boreal Forest"),
        ("lion_sample.jpg", "African Lion", (50, 180, 220), "Savanna Plains"),
        ("giraffe_sample.jpg", "Masai Giraffe", (40, 160, 210), "Acacia Woodland"),
        ("leopard_sample.jpg", "Leopard", (30, 170, 230), "Dense Scrub"),
        ("bear_sample.jpg", "Brown Bear", (30, 70, 110), "Mountain Forest"),
        ("crocodile_sample.jpg", "Nile Crocodile", (40, 90, 50), "River Delta"),
    ]

    generated_paths = []

    for filename, species_name, color, habitat in samples:
        # Create a 640x480 RGB image canvas
        img = np.zeros((480, 640, 3), dtype=np.uint8)

        # Draw a natural background gradient
        for y in range(480):
            r = int(30 + (y / 480) * 40)
            g = int(60 + (y / 480) * 80)
            b = int(20 + (y / 480) * 30)
            img[y, :] = (b, g, r)

        # Draw realistic bounding box animal subject
        x1, y1, x2, y2 = 120, 80, 520, 400
        cv2.rectangle(img, (x1, y1), (x2, y2), color, -1)
        cv2.rectangle(img, (x1, y1), (x2, y2), (255, 255, 255), 3)

        # Add text label onto sample image
        cv2.putText(img, f"Wildlife Sample: {species_name}", (140, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(img, f"Habitat: {habitat}", (140, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (220, 220, 220), 1)

        file_path = output_dir / filename
        cv2.imwrite(str(file_path), img)
        generated_paths.append((species_name, file_path))
        print(f"Generated sample image: {file_path}")

    print("\nSample images created successfully in:", output_dir)
    return generated_paths


if __name__ == "__main__":
    create_sample_images()
