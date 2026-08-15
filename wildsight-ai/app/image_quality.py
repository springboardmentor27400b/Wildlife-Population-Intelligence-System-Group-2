from PIL import Image
import cv2
import numpy as np


def assess_image_quality(image_path):

    image = cv2.imread(image_path)

    if image is None:
        return {
            "quality": "invalid",
            "score": 0,
            "brightness": 0,
            "sharpness": 0
        }


    # Brightness calculation

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )


    brightness = np.mean(gray)



    # Sharpness calculation

    sharpness = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()



    score = 0


    # Brightness score

    if 60 < brightness < 200:
        score += 50


    # Sharpness score

    if sharpness > 100:
        score += 50



    if score >= 80:
        quality = "Excellent"

    elif score >= 50:
        quality = "Good"

    else:
        quality = "Poor"



    return {

        "quality": quality,

        "score": score,

        "brightness": round(
            float(brightness),
            2
        ),

        "sharpness": round(
            float(sharpness),
            2
        )

    }