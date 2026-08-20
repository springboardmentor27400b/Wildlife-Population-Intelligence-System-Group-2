from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer


# Load BirdNET model
analyzer = Analyzer()


def detect_birds(audio_path: str):

    recording = Recording(
        analyzer,
        audio_path,
        min_conf=0.1,
    )

    recording.analyze()

    predictions = []

    for detection in recording.detections:

        predictions.append({
            "species": detection["common_name"],
            "scientific_name": detection["scientific_name"],
            "confidence": round(
                float(detection["confidence"]),
                4
            ),
        })

    return predictions