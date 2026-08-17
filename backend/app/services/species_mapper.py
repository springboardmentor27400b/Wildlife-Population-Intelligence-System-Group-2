# app/services/species_mapper.py

SPECIES_MAP = {

    # Birds
    "Bird vocalization, bird call, bird song": {
        "species": "Indian Peacock",
        "call_type": "Alarm Call",
        "habitat": "Forest",
        "event": "Communication",
        "noise_level": "Low"
    },

    "Chirp, tweet": {
        "species": "House Sparrow",
        "call_type": "Chirp",
        "habitat": "Urban Forest",
        "event": "Communication",
        "noise_level": "Low"
    },

    "Owl": {
        "species": "Barn Owl",
        "call_type": "Night Call",
        "habitat": "Forest",
        "event": "Territorial",
        "noise_level": "Low"
    },

    # Mammals
    "Roar": {
        "species": "Bengal Tiger",
        "call_type": "Roar",
        "habitat": "Dense Forest",
        "event": "Territorial",
        "noise_level": "Medium"
    },

    "Growling": {
        "species": "Leopard",
        "call_type": "Growl",
        "habitat": "Forest",
        "event": "Warning",
        "noise_level": "Medium"
    },

    "Elephant": {
        "species": "Asian Elephant",
        "call_type": "Trumpet",
        "habitat": "Forest",
        "event": "Communication",
        "noise_level": "Medium"
    },

    "Dog": {
        "species": "Indian Wild Dog",
        "call_type": "Bark",
        "habitat": "Forest",
        "event": "Pack Communication",
        "noise_level": "Medium"
    }
}


def map_species(class_name):

    for key in SPECIES_MAP:

        if key.lower() in class_name.lower():

            return SPECIES_MAP[key]

    return {
        "species": "Unknown Wildlife",
        "call_type": "Unknown",
        "habitat": "Unknown",
        "event": "Unknown",
        "noise_level": "Unknown"
    }