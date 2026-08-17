from collections import Counter

from collections import defaultdict


def species_distribution(species):

    distribution = defaultdict(int)

    for name in species:

        if not name:
            continue

        # Normalize species names
        normalized_name = name.strip().lower()

        # Standardize known species names
        species_names = {
            "bengal tiger": "Bengal Tiger",
            "tiger": "Bengal Tiger",
            "elephant": "Elephant",
            "lion": "Lion",
            "goat": "Goat",
            "deer": "Deer",
            "leopard": "Leopard",
            "lepoard": "Leopard"
        }

        normalized_name = species_names.get(
            normalized_name,
            normalized_name.title()
        )

        distribution[normalized_name] += 1


    species_distribution_data = [
        {
            "species": name,
            "population": count
        }
        for name, count in distribution.items()
    ]


    species_distribution_data.sort(
        key=lambda x: x["population"],
        reverse=True
    )


    total_population = sum(
        item["population"]
        for item in species_distribution_data
    )


    dominant_species = (
        species_distribution_data[0]["species"]
        if species_distribution_data
        else None
    )


    return {

        "species_distribution":
            species_distribution_data,

        "species_richness":
            len(species_distribution_data),

        "dominant_species":
            dominant_species
    }