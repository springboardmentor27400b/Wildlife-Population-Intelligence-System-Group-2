import json
import os

PROFILE_PATH = "data/species_profiles.json"

with open(PROFILE_PATH, "r") as f:
    profiles = json.load(f)


def classify_species(yolo_result):

    detections = yolo_result.get("detections", [])

    if len(detections) == 0:

        return {
            "species": "Unknown Species",
            "confidence": 0,
            "status": "Needs Expert Review"
        }

    detected = detections[0]["species"].lower()

    confidence = detections[0]["confidence"]

    profile = profiles.get(detected)

    if profile is None:

        return {
            "species": detected.title(),
            "confidence": confidence,
            "status": "Profile Not Available"
        }

    return {
    "species": detected.title(),
    "common_name": profile.get("common_name"),
    "scientific_name": profile.get("scientific_name"),
    "kingdom": profile.get("kingdom"),
    "phylum": profile.get("phylum"),
    "class_name": profile.get("class_name"),
    "order": profile.get("order"),
    "family": profile.get("family"),
    "genus": profile.get("genus"),
    "conservation_status": profile.get("conservation_status"),
    "description": profile.get("description"),
    "confidence": confidence
}