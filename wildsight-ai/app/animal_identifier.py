from PIL import Image
import hashlib


animal_database = {}


def generate_animal_id(image_path):

    image = Image.open(image_path).convert("RGB")

    image = image.resize((128,128))

    image_bytes = image.tobytes()

    hash_value = hashlib.sha256(
        image_bytes
    ).hexdigest()

    return "WL-" + hash_value[:6].upper()



def identify_animal(image_path, species):

    animal_id = generate_animal_id(image_path)


    if animal_id in animal_database:

        return {

            "animalId": animal_id,

            "existingAnimal": True,

            "similarity": 95

        }



    animal_database[animal_id] = {

        "species": species

    }


    return {

        "animalId": animal_id,

        "existingAnimal": False,

        "similarity": 0

    }