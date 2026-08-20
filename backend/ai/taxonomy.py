taxonomy_database = {

    "Bengal Tiger": {
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Mammalia",
        "order": "Carnivora",
        "family": "Felidae",
        "genus": "Panthera",
        "species": "Panthera tigris"
    },

    "Lion": {
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Mammalia",
        "order": "Carnivora",
        "family": "Felidae",
        "genus": "Panthera",
        "species": "Panthera leo"
    },

    "Elephant": {
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Mammalia",
        "order": "Proboscidea",
        "family": "Elephantidae",
        "genus": "Elephas",
        "species": "Elephas maximus"
    },

    "Peacock": {
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class": "Aves",
        "order": "Galliformes",
        "family": "Phasianidae",
        "genus": "Pavo",
        "species": "Pavo cristatus"
    }

}


def get_taxonomy(species_name):

    return taxonomy_database.get(
        species_name,
        {
            "kingdom": "-",
            "phylum": "-",
            "class": "-",
            "order": "-",
            "family": "-",
            "genus": "-",
            "species": "-"
        }
    )