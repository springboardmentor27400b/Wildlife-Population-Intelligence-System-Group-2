def detect_behavior(species):

    behaviors = {


        # ================= MAMMALS =================

        "wolf": [
            "Standing",
            "Walking",
            "Running",
            "Hunting",
            "Alert"
        ],

        "tiger": [
            "Walking",
            "Hunting",
            "Resting",
            "Roaring"
        ],

        "lion": [
            "Walking",
            "Hunting",
            "Resting",
            "Roaring"
        ],

        "elephant": [
            "Walking",
            "Feeding",
            "Drinking",
            "Social Interaction"
        ],

        "deer": [
            "Grazing",
            "Walking",
            "Running",
            "Alert"
        ],

        "bear": [
            "Walking",
            "Searching Food",
            "Climbing",
            "Resting"
        ],

        "monkey": [
            "Climbing",
            "Jumping",
            "Feeding",
            "Social Interaction"
        ],

        "leopard": [
            "Walking",
            "Climbing",
            "Hunting",
            "Resting"
        ],



        # ================= BIRDS =================


        "bird": [
            "Flying",
            "Perching",
            "Feeding",
            "Nesting"
        ],

        "eagle": [
            "Flying",
            "Hunting",
            "Perching"
        ],

        "peacock": [
            "Walking",
            "Displaying Feathers",
            "Feeding"
        ],

        "owl": [
            "Flying",
            "Perching",
            "Hunting"
        ],

        "parrot": [
            "Flying",
            "Feeding",
            "Perching"
        ],



        # ================= REPTILES =================


        "snake": [
            "Crawling",
            "Hunting",
            "Resting"
        ],

        "crocodile": [
            "Swimming",
            "Basking",
            "Hunting"
        ],

        "turtle": [
            "Swimming",
            "Walking",
            "Resting"
        ],



        # ================= AMPHIBIANS =================


        "frog": [
            "Jumping",
            "Swimming",
            "Resting"
        ],

        "salamander": [
            "Walking",
            "Swimming",
            "Resting"
        ],



        # ================= INSECTS =================


        "butterfly": [
            "Flying",
            "Feeding",
            "Resting"
        ],

        "bee": [
            "Flying",
            "Collecting Nectar",
            "Hive Activity"
        ],

        "dragonfly": [
            "Flying",
            "Hunting",
            "Resting"
        ],



        # ================= MARINE =================


        "dolphin": [
            "Swimming",
            "Jumping",
            "Social Interaction"
        ],

        "whale": [
            "Swimming",
            "Breaching",
            "Feeding"
        ],

        "shark": [
            "Swimming",
            "Hunting"
        ]

    }



    species = species.lower()



    if species in behaviors:

        return {

            "behavior": behaviors[species][0],

            "possibleBehaviors": behaviors[species]

        }



    return {

        "behavior": "Unknown",

        "possibleBehaviors": [

            "Moving",

            "Resting",

            "Feeding"

        ]

    }