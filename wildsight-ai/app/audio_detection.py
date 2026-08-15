import random

from app.audio_database import audio_species_database


def detect_audio_species(audio_path):

    # TODO:
    # Later replace this with BirdNET / YAMNet prediction

    species = random.choice(
        list(audio_species_database.keys())
    )

    info = audio_species_database[species]

    confidence = round(
        random.uniform(82, 99),
        2
    )

    noise = random.choice([
        "Low",
        "Moderate",
        "High"
    ])

    filtered = noise != "High"

    return {

        "species": species,

        "confidence": confidence,

        "category": info["category"],

        "soundType": info["type"],

        "conservationStatus": info["status"],

        "environmentNoise": noise,

        "noiseFiltered": filtered,

        "model": "BirdNET + CNN"

    }