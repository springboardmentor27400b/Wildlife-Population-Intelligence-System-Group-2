# species_status.py


SPECIES_DATABASE = {


# ================= MAMMALS =================


"tiger": {
    "status":"Endangered",
    "category":"Mammal",
    "family":"Felidae",
    "protection":"High Priority"
},

"lion":{
    "status":"Vulnerable",
    "category":"Mammal",
    "family":"Felidae",
    "protection":"Protected"
},

"elephant":{
    "status":"Endangered",
    "category":"Mammal",
    "family":"Elephantidae",
    "protection":"High Priority"
},

"leopard":{
    "status":"Vulnerable",
    "category":"Mammal",
    "family":"Felidae",
    "protection":"Protected"
},

"cheetah":{
    "status":"Vulnerable",
    "category":"Mammal",
    "family":"Felidae",
    "protection":"Protected"
},

"jaguar":{
    "status":"Near Threatened",
    "category":"Mammal",
    "family":"Felidae",
    "protection":"Protected"
},

"wolf":{
    "status":"Least Concern",
    "category":"Mammal",
    "family":"Canidae",
    "protection":"Normal"
},

"fox":{
    "status":"Least Concern",
    "category":"Mammal",
    "family":"Canidae",
    "protection":"Normal"
},

"bear":{
    "status":"Vulnerable",
    "category":"Mammal",
    "family":"Ursidae",
    "protection":"Protected"
},

"panda":{
    "status":"Vulnerable",
    "category":"Mammal",
    "family":"Ursidae",
    "protection":"High Priority"
},

"giraffe":{
    "status":"Vulnerable",
    "category":"Mammal",
    "family":"Giraffidae",
    "protection":"Protected"
},

"zebra":{
    "status":"Near Threatened",
    "category":"Mammal",
    "family":"Equidae",
    "protection":"Protected"
},

"rhino":{
    "status":"Critically Endangered",
    "category":"Mammal",
    "family":"Rhinocerotidae",
    "protection":"Extreme Priority"
},

"hippopotamus":{
    "status":"Vulnerable",
    "category":"Mammal",
    "family":"Hippopotamidae",
    "protection":"Protected"
},

"deer":{
    "status":"Least Concern",
    "category":"Mammal",
    "family":"Cervidae",
    "protection":"Normal"
},



# ================= BIRDS =================


"peacock":{
    "status":"Protected",
    "category":"Bird",
    "family":"Phasianidae",
    "protection":"National Bird"
},

"eagle":{
    "status":"Protected",
    "category":"Bird",
    "family":"Accipitridae",
    "protection":"Protected"
},

"owl":{
    "status":"Protected",
    "category":"Bird",
    "family":"Strigidae",
    "protection":"Protected"
},

"parrot":{
    "status":"Protected",
    "category":"Bird",
    "family":"Psittacidae",
    "protection":"Protected"
},

"penguin":{
    "status":"Vulnerable",
    "category":"Bird",
    "family":"Spheniscidae",
    "protection":"Protected"
},

"flamingo":{
    "status":"Least Concern",
    "category":"Bird",
    "family":"Phoenicopteridae",
    "protection":"Normal"
},

"crow":{
    "status":"Least Concern",
    "category":"Bird",
    "family":"Corvidae",
    "protection":"Normal"
},

"duck":{
    "status":"Least Concern",
    "category":"Bird",
    "family":"Anatidae",
    "protection":"Normal"
},



# ================= REPTILES =================


"crocodile":{
    "status":"Vulnerable",
    "category":"Reptile",
    "family":"Crocodylidae",
    "protection":"Protected"
},

"alligator":{
    "status":"Least Concern",
    "category":"Reptile",
    "family":"Alligatoridae",
    "protection":"Normal"
},

"snake":{
    "status":"Normal",
    "category":"Reptile",
    "family":"Serpentes",
    "protection":"Protected"
},

"python":{
    "status":"Protected",
    "category":"Reptile",
    "family":"Pythonidae",
    "protection":"Protected"
},

"turtle":{
    "status":"Endangered",
    "category":"Reptile",
    "family":"Testudines",
    "protection":"High Priority"
},



# ================= AMPHIBIANS =================


"frog":{
    "status":"Normal",
    "category":"Amphibian",
    "family":"Ranidae",
    "protection":"Protected"
},

"salamander":{
    "status":"Vulnerable",
    "category":"Amphibian",
    "family":"Salamandridae",
    "protection":"Protected"
},



# ================= INSECTS =================


"butterfly":{
    "status":"Normal",
    "category":"Insect",
    "family":"Nymphalidae",
    "protection":"Normal"
},

"bee":{
    "status":"Normal",
    "category":"Insect",
    "family":"Apidae",
    "protection":"Protected"
},

"dragonfly":{
    "status":"Normal",
    "category":"Insect",
    "family":"Odonata",
    "protection":"Normal"
},



# ================= MARINE =================


"whale":{
    "status":"Endangered",
    "category":"Marine Species",
    "family":"Cetacea",
    "protection":"High Priority"
},

"dolphin":{
    "status":"Protected",
    "category":"Marine Species",
    "family":"Delphinidae",
    "protection":"Protected"
},

"shark":{
    "status":"Vulnerable",
    "category":"Marine Species",
    "family":"Selachimorpha",
    "protection":"Protected"
},

"octopus":{
    "status":"Normal",
    "category":"Marine Species",
    "family":"Cephalopoda",
    "protection":"Normal"
}


}



def get_species_status(species):

    species = species.lower()


    if species in SPECIES_DATABASE:

        data = SPECIES_DATABASE[species]

        return {

            "endangered":
            data["status"] in [
                "Endangered",
                "Critically Endangered"
            ],

            "speciesStatus":
            data["status"],

            "category":
            data["category"],

            "family":
            data["family"],

            "protectionLevel":
            data["protection"]

        }


    return {

        "endangered":False,

        "speciesStatus":"Unknown",

        "category":"Unknown",

        "family":"Unknown",

        "protectionLevel":"Unknown"

    }