# app/services/bird_recognition.py

from app.services.bird_database import BIRD_DATABASE


def recognize_bird(class_name, confidence):
    """
    Converts YAMNet labels into bird information.
    """

    class_name = class_name.lower()

    if "bird" not in class_name:
        return None

    # Simple keyword mapping
    if "owl" in class_name:
        bird = "Barn Owl"

    elif "sparrow" in class_name:
        bird = "House Sparrow"

    elif "crow" in class_name:
        bird = "House Crow"

    elif "peacock" in class_name:
        bird = "Indian Peacock"

    else:
        bird = "Indian Peacock"

    info = BIRD_DATABASE.get(
        bird,
        {
            "scientific_name": "Unknown",
            "habitat": "Unknown",
            "call_type": "Unknown",
            "status": "Unknown"
        }
    )

    return {

        "species": bird,

        "scientific_name": info["scientific_name"],

        "call_type": info["call_type"],

        "habitat": info["habitat"],

        "conservation_status": info["status"],

        "confidence": round(confidence,2)

    }