from app.taxonomy import get_taxonomy
from birdnetlib import Recording
from app.birdnet_loader import analyzer



def predict_bird(audio_path):


    recording = Recording(
        analyzer,
        str(audio_path)
    )


    recording.analyze()



    if len(recording.detections) == 0:

        return {

            "status": "FAILED",

            "species": "Unknown",

            "confidence": 0,

            "category": "Bird"

        }



    best = max(
        recording.detections,
        key=lambda x: x["confidence"]
    )



    species = best["common_name"]



    # TAXONOMY LOOKUP

    taxonomy = get_taxonomy(species)

    confidence = round(best["confidence"] * 100, 2)

    return {

    "species": species,

    "scientificName": taxonomy["scientificName"],

    "kingdom": taxonomy["kingdom"],

    "phylum": taxonomy["phylum"],

    "className": taxonomy["className"],

    "order": taxonomy["order"],

    "family": taxonomy["family"],

    "genus": taxonomy["genus"],

    "confidence": confidence,

    "category": "Bird",

    "soundType": "Bird Call",

    "conservationStatus": "Protected",

    "noiseFiltered": True,

    "environmentNoise": "Unknown",

    "model": "BirdNET Analyzer"
}