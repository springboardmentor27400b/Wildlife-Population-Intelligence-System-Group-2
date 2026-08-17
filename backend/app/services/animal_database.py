ANIMAL_DATABASE = {

    "Animal": {
        "species": "Unknown Mammal",
        "scientific_name": "Unknown",
        "call_type": "Vocalization",
        "habitat": "Forest",
        "conservation_status": "Unknown"
    },

    "Wild animals": {
        "species": "Wild Animal",
        "scientific_name": "Unknown",
        "call_type": "Roar",
        "habitat": "Forest",
        "conservation_status": "Protected"
    },

    "Roar": {
        "species": "Bengal Tiger",
        "scientific_name": "Panthera tigris",
        "call_type": "Roar",
        "habitat": "Dense Forest",
        "conservation_status": "Endangered"
    },

    "Growling": {
        "species": "Leopard",
        "scientific_name": "Panthera pardus",
        "call_type": "Growl",
        "habitat": "Forest",
        "conservation_status": "Vulnerable"
    },

    "Howl": {
        "species": "Indian Wolf",
        "scientific_name": "Canis lupus pallipes",
        "call_type": "Howl",
        "habitat": "Grassland",
        "conservation_status": "Endangered"
    },

    "Elephant": {
        "species": "Asian Elephant",
        "scientific_name": "Elephas maximus",
        "call_type": "Trumpet",
        "habitat": "Forest",
        "conservation_status": "Endangered"
    },

    "Tiger": {
        "species": "Bengal Tiger",
        "scientific_name": "Panthera tigris",
        "call_type": "Roar",
        "habitat": "Dense Forest",
        "conservation_status": "Endangered"
    },

    "Dog": {
        "species": "Indian Wild Dog",
        "scientific_name": "Cuon alpinus",
        "call_type": "Bark",
        "habitat": "Forest",
        "conservation_status": "Endangered"
    }

}


def identify_animal(label):

    # Exact match first
    if label in ANIMAL_DATABASE:
        return ANIMAL_DATABASE[label]

    label = label.lower()

    # Then partial match
    for key, value in ANIMAL_DATABASE.items():
        if key.lower() == label:
            return value

    for key, value in ANIMAL_DATABASE.items():
        if key.lower() in label:
            return value

    return {
        "species": "Unknown Animal",
        "scientific_name": "Unknown",
        "call_type": "Unknown",
        "habitat": "Unknown",
        "conservation_status": "Unknown"
    }