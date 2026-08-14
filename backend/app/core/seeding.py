import logging
from sqlalchemy.orm import Session
from app.models.species_profile import SpeciesProfile

logger = logging.getLogger("wildlife")

# Static data dictionary containing all 54 target species
SEEDED_SPECIES = [
    {
        "common_name": "Lion",
        "scientific_name": "Panthera_leo",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Carnivora", "family": "Felidae", "genus": "Panthera", "species": "Panthera leo"},
        "habitat": "Savanna, Grassland, Open Woodland",
        "diet": "Carnivore",
        "lifespan": "10-14 years in the wild",
        "conservation_status": "Vulnerable",
        "population_trend": "Decreasing",
        "population_estimate": "20,000 - 39,000",
        "threat_level": "High",
        "native_regions": "Sub-Saharan Africa, Gir Forest in India",
        "interesting_facts": ["Lions are the only social cats, living in groups called prides.", "A lion's roar can be heard from up to 5 miles away."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Lion",
        "iucn_link": "https://www.iucnredlist.org/species/15951/115130419"
    },
    {
        "common_name": "Bengal Tiger",
        "scientific_name": "Panthera_tigris",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Carnivora", "family": "Felidae", "genus": "Panthera", "species": "Panthera tigris"},
        "habitat": "Tropical Rainforest, Deciduous Forest, Mangroves",
        "diet": "Carnivore",
        "lifespan": "8-10 years in the wild",
        "conservation_status": "Endangered",
        "population_trend": "Decreasing",
        "population_estimate": "3,000 - 4,500",
        "threat_level": "Critical",
        "native_regions": "India, Bangladesh, Nepal, Bhutan",
        "interesting_facts": ["No two tigers have the same stripes; they are unique like human fingerprints.", "Tigers are excellent swimmers and often soak in water to cool off."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Bengal_tiger",
        "iucn_link": "https://www.iucnredlist.org/species/15955/50659951"
    },
    {
        "common_name": "Leopard",
        "scientific_name": "Panthera_pardus",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Carnivora", "family": "Felidae", "genus": "Panthera", "species": "Panthera pardus"},
        "habitat": "Forests, Savannas, Mountains, Deserts",
        "diet": "Carnivore",
        "lifespan": "12-17 years",
        "conservation_status": "Vulnerable",
        "population_trend": "Decreasing",
        "population_estimate": "Unknown (estimates exceed 100,000)",
        "threat_level": "Medium",
        "native_regions": "Sub-Saharan Africa, Central Asia, India, China",
        "interesting_facts": ["Leopards are renowned for their agility, often dragging heavy prey up trees to protect it from scavengers.", "They can run up to 36 mph and leap 20 feet horizontally."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Leopard",
        "iucn_link": "https://www.iucnredlist.org/species/15954/163994274"
    },
    {
        "common_name": "Cheetah",
        "scientific_name": "Acinonyx_jubatus",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Carnivora", "family": "Felidae", "genus": "Acinonyx", "species": "Acinonyx jubatus"},
        "habitat": "Dry Forests, Grasslands, Savannas",
        "diet": "Carnivore",
        "lifespan": "10-12 years",
        "conservation_status": "Vulnerable",
        "population_trend": "Decreasing",
        "population_estimate": "6,674",
        "threat_level": "High",
        "native_regions": "Africa, Iran",
        "interesting_facts": ["Cheetahs are the fastest land mammals, reaching speeds up to 70 mph.", "They use their muscular tails as a rudder during high-speed chases."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Cheetah",
        "iucn_link": "https://www.iucnredlist.org/species/219/13035346"
    },
    {
        "common_name": "Jaguar",
        "scientific_name": "Panthera_onca",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Carnivora", "family": "Felidae", "genus": "Panthera", "species": "Panthera onca"},
        "habitat": "Rainforests, Swamps, Floodplains",
        "diet": "Carnivore",
        "lifespan": "12-15 years",
        "conservation_status": "Near Threatened",
        "population_trend": "Decreasing",
        "population_estimate": "15,000",
        "threat_level": "Medium",
        "native_regions": "South America, Central America, Southwestern USA",
        "interesting_facts": ["Jaguars have an exceptionally powerful bite that can pierce turtle shells.", "Unlike many cats, jaguars love water and are proficient hunters in rivers."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Jaguar",
        "iucn_link": "https://www.iucnredlist.org/species/15953/123791436"
    },
    {
        "common_name": "African Elephant",
        "scientific_name": "Loxodonta_africana",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Proboscidea", "family": "Elephantidae", "genus": "Loxodonta", "species": "Loxodonta africana"},
        "habitat": "Savannas, Forests, Deserts",
        "diet": "Herbivore",
        "lifespan": "60-70 years",
        "conservation_status": "Endangered",
        "population_trend": "Decreasing",
        "population_estimate": "415,000",
        "threat_level": "High",
        "native_regions": "Sub-Saharan Africa",
        "interesting_facts": ["African Elephants are the largest land animals on Earth.", "An elephant's trunk contains over 40,000 muscles and is sensitive enough to pick up a single blade of grass."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/African_elephant",
        "iucn_link": "https://www.iucnredlist.org/species/181008073/204401095"
    },
    {
        "common_name": "Asian Elephant",
        "scientific_name": "Elephas_maximus",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Proboscidea", "family": "Elephantidae", "genus": "Elephas", "species": "Elephas maximus"},
        "habitat": "Grasslands, Tropical Forests",
        "diet": "Herbivore",
        "lifespan": "48-50 years",
        "conservation_status": "Endangered",
        "population_trend": "Decreasing",
        "population_estimate": "40,000 - 50,000",
        "threat_level": "High",
        "native_regions": "Southeast Asia, India, Sri Lanka",
        "interesting_facts": ["Asian elephants have smaller ears than their African cousins.", "They have one finger-like feature at the tip of their trunk, whereas African elephants have two."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Asian_elephant",
        "iucn_link": "https://www.iucnredlist.org/species/7140/4582910"
    },
    {
        "common_name": "White Rhinoceros",
        "scientific_name": "Ceratotherium_simum",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Perissodactyla", "family": "Rhinocerotidae", "genus": "Ceratotherium", "species": "Ceratotherium simum"},
        "habitat": "Grasslands, Savannas",
        "diet": "Herbivore",
        "lifespan": "35-40 years",
        "conservation_status": "Near Threatened",
        "population_trend": "Decreasing",
        "population_estimate": "18,000",
        "threat_level": "High",
        "native_regions": "Southern and East Africa",
        "interesting_facts": ["The name 'white' is a corruption of the Afrikaans word 'wyd' referring to their wide mouth.", "White rhinos are the second largest land mammal after elephants."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/White_rhinoceros",
        "iucn_link": "https://www.iucnredlist.org/species/4185/45813880"
    },
    {
        "common_name": "Black Rhinoceros",
        "scientific_name": "Diceros_bicornis",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Perissodactyla", "family": "Rhinocerotidae", "genus": "Diceros", "species": "Diceros bicornis"},
        "habitat": "Tropical Grasslands, Shrublands, Deserts",
        "diet": "Herbivore",
        "lifespan": "35-50 years",
        "conservation_status": "Critically Endangered",
        "population_trend": "Increasing",
        "population_estimate": "5,630",
        "threat_level": "Critical",
        "native_regions": "East and Southern Africa",
        "interesting_facts": ["Black rhinos have a prehensile hooked upper lip used for browsing on twigs and shrubs.", "They are actually grey in color, same as the white rhino."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Black_rhinoceros",
        "iucn_link": "https://www.iucnredlist.org/species/6557/152022823"
    },
    {
        "common_name": "Hippopotamus",
        "scientific_name": "Hippopotamus_amphibius",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Artiodactyla", "family": "Hippopotamidae", "genus": "Hippopotamus", "species": "Hippopotamus amphibius"},
        "habitat": "Rivers, Lakes, Swamps, Grasslands",
        "diet": "Herbivore",
        "lifespan": "40-50 years",
        "conservation_status": "Vulnerable",
        "population_trend": "Stable",
        "population_estimate": "115,000 - 130,000",
        "threat_level": "Medium",
        "native_regions": "Sub-Saharan Africa",
        "interesting_facts": ["Hippos secrete a red oily fluid that acts as a natural sunscreen and moisturizer.", "Despite their bulky shape, they can run up to 19 mph on land."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Hippopotamus",
        "iucn_link": "https://www.iucnredlist.org/species/10103/18567364"
    },
    {
        "common_name": "Northern Giraffe",
        "scientific_name": "Giraffa_camelopardalis",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Artiodactyla", "family": "Giraffidae", "genus": "Giraffa", "species": "Giraffa camelopardalis"},
        "habitat": "Savannas, Woodlands",
        "diet": "Herbivore",
        "lifespan": "25 years in the wild",
        "conservation_status": "Vulnerable",
        "population_trend": "Decreasing",
        "population_estimate": "68,000",
        "threat_level": "Medium",
        "native_regions": "East, West and Central Africa",
        "interesting_facts": ["Giraffes are the tallest mammals on Earth, with legs taller than many humans.", "They sleep standing up for only 10 minutes to 2 hours per day."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Northern_giraffe",
        "iucn_link": "https://www.iucnredlist.org/species/9194/136266699"
    },
    {
        "common_name": "Plains Zebra",
        "scientific_name": "Equus_quagga",
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": "Mammalia", "order": "Perissodactyla", "family": "Equidae", "genus": "Equus", "species": "Equus quagga"},
        "habitat": "Grasslands, Savannas, Shrublands",
        "diet": "Herbivore",
        "lifespan": "20-25 years",
        "conservation_status": "Near Threatened",
        "population_trend": "Decreasing",
        "population_estimate": "500,000",
        "threat_level": "Low",
        "native_regions": "East and Southern Africa",
        "interesting_facts": ["Zebra stripes act as a natural bug repellent, confusing the vision of biting flies.", "A group of zebras is collectively called a 'dazzle'."],
        "wikipedia_link": "https://en.wikipedia.org/wiki/Plains_zebra",
        "iucn_link": "https://www.iucnredlist.org/species/7838/115252922"
    }
]

# Generate additional mock species profiles to complete all 54 target categories
# using realistic baseline attributes for wildlife detection models
MOCK_SPECIES_NAMES = [
    ("Cape Buffalo", "Syncerus_caffer", "Bovidae", "Herbivore", "Least Concern"),
    ("Wildebeest", "Connochaetes_taurinus", "Bovidae", "Herbivore", "Least Concern"),
    ("Impala", "Aepyceros_melampus", "Bovidae", "Herbivore", "Least Concern"),
    ("Thomson's Gazelle", "Eudorcas_thomsonii", "Bovidae", "Herbivore", "Least Concern"),
    ("Spotted Hyena", "Crocuta_crocuta", "Hyaenidae", "Carnivore", "Least Concern"),
    ("African Wild Dog", "Lycaon_pictus", "Canidae", "Carnivore", "Endangered"),
    ("Gorilla", "Gorilla_gorilla", "Hominidae", "Herbivore", "Critically Endangered"),
    ("Chimpanzee", "Pan_troglodytes", "Hominidae", "Omnivore", "Endangered"),
    ("Orangutan", "Pongo_pygmaeus", "Hominidae", "Herbivore", "Critically Endangered"),
    ("Ring-tailed Lemur", "Lemur_catta", "Lemuridae", "Omnivore", "Endangered"),
    ("Brown Bear", "Ursus_arctos", "Ursidae", "Omnivore", "Least Concern"),
    ("Polar Bear", "Ursus_maritimus", "Ursidae", "Carnivore", "Vulnerable"),
    ("Giant Panda", "Ailuropoda_melanoleuca", "Ursidae", "Herbivore", "Vulnerable"),
    ("Grey Wolf", "Canis_lupus", "Canidae", "Carnivore", "Least Concern"),
    ("Cougar", "Puma_concolor", "Felidae", "Carnivore", "Least Concern"),
    ("Snow Leopard", "Panthera_uncia", "Felidae", "Carnivore", "Vulnerable"),
    ("Red Panda", "Ailurus_fulgens", "Ailuridae", "Herbivore", "Endangered"),
    ("Koala", "Phascolarctos_cinereus", "Phascolarctidae", "Herbivore", "Vulnerable"),
    ("Red Kangaroo", "Osphranter_rufus", "Macropodidae", "Herbivore", "Least Concern"),
    ("Platypus", "Ornithorhynchus_anatinus", "Ornithorhynchidae", "Carnivore", "Near Threatened"),
    ("Bald Eagle", "Haliaeetus_leucocephalus", "Accipitridae", "Carnivore", "Least Concern"),
    ("Golden Eagle", "Aquila_chrysaetos", "Accipitridae", "Carnivore", "Least Concern"),
    ("Peregrine Falcon", "Falco_peregrinus", "Falconidae", "Carnivore", "Least Concern"),
    ("Osprey", "Pandion_haliaetus", "Pandionidae", "Carnivore", "Least Concern"),
    ("Emperor Penguin", "Aptenodytes_forsteri", "Spheniscidae", "Carnivore", "Near Threatened"),
    ("Gentoo Penguin", "Pygoscelis_papua", "Spheniscidae", "Carnivore", "Least Concern"),
    ("Great Blue Heron", "Ardea_herodias", "Ardeidae", "Carnivore", "Least Concern"),
    ("American Flamingo", "Phoenicopterus_ruber", "Phoenicopteridae", "Filter Feeder", "Least Concern"),
    ("Mallard", "Anas_platyrhynchos", "Anatidae", "Omnivore", "Least Concern"),
    ("Canada Goose", "Branta_canadensis", "Anatidae", "Herbivore", "Least Concern"),
    ("Wild Turkey", "Meleagris_gallopavo", "Phasianidae", "Omnivore", "Least Concern"),
    ("Ostrich", "Struthio_camelus", "Struthionidae", "Omnivore", "Least Concern"),
    ("Emu", "Dromaius_novaehollandiae", "Casuariidae", "Omnivore", "Least Concern"),
    ("Komodo Dragon", "Varanus_komodoensis", "Varanidae", "Carnivore", "Endangered"),
    ("Green Sea Turtle", "Chelonia_mydas", "Cheloniidae", "Herbivore", "Endangered"),
    ("Leatherback Sea Turtle", "Dermochelys_coriacea", "Dermochelyidae", "Carnivore", "Vulnerable"),
    ("American Alligator", "Alligator_mississippiensis", "Alligatoridae", "Carnivore", "Least Concern"),
    ("Nile Crocodile", "Crocodylus_niloticus", "Crocodylidae", "Carnivore", "Least Concern"),
    ("Bullfrog", "Lithobates_catesbeianus", "Ranidae", "Carnivore", "Least Concern"),
    ("Poison Dart Frog", "Dendrobatidae", "Dendrobatidae", "Insectivore", "Vulnerable"),
    ("Red Fox", "Vulpes_vulpes", "Canidae", "Omnivore", "Least Concern"),
    ("Eurasian Badger", "Meles_meles", "Mustelidae", "Omnivore", "Least Concern"),
    ("Indian Eagle Owl", "Bubo_bengalensis", "Strigidae", "Carnivore", "Least Concern"),
    ("Owl", "Bubo_bubo", "Strigidae", "Carnivore", "Least Concern"),
    ("Woodpecker", "Dryocopus_martius", "Picidae", "Insectivore", "Least Concern"),
    ("sprpw", "Passer_domesticus", "Passeridae", "Omnivore", "Least Concern"),
    ("Sparrow", "Passer_domesticus_2", "Passeridae", "Omnivore", "Least Concern"),
    ("duck", "Anas_platyrhynchos_2", "Anatidae", "Omnivore", "Least Concern"),
    ("Duck", "Anas_platyrhynchos_3", "Anatidae", "Omnivore", "Least Concern"),
    ("cat", "Felis_catus", "Felidae", "Carnivore", "Least Concern"),
    ("Cat", "Felis_catus_2", "Felidae", "Carnivore", "Least Concern"),
    ("p", "Palaemonetes_paludosus", "Palaemonidae", "Omnivore", "Least Concern"),
    ("sun", "Helianthus_annuus", "Asteraceae", "Producer", "Least Concern"),
    ("Guyalna cuta", "Guyalna_cuta", "Cicadidae", "Herbivore", "Least Concern"),
    ("Wrestler Frog", "Physalaemus_cuvieri", "Leptodactylidae", "Insectivore", "Least Concern"),
    ("Plush-crested Jay", "Cyanocorax_chrysops", "Corvidae", "Omnivore", "Least Concern"),
    ("Ashy-headed Greenlet", "Hylophilus_pectoralis", "Vireonidae", "Insectivore", "Least Concern"),
    ("Barred Forest-Falcon", "Micrastur_ruficollis", "Falconidae", "Carnivore", "Least Concern"),
    ("Yellow-olive Flatbill", "Tolmomyias_sulphurescens", "Tyrannidae", "Insectivore", "Least Concern"),
    ("ko", "Ko_ko", "Unknown", "Omnivore", "Least Concern"),
    ("Spider", "Argiope_bruennichi", "Araneidae", "Carnivore", "Least Concern"),
    ("spider", "Argiope_bruennichi_2", "Araneidae", "Carnivore", "Least Concern")
]

for name, sci_name, family, diet, status in MOCK_SPECIES_NAMES:
    genus = sci_name.split("_")[0]
    
    # Resolve Class
    if any(k in name for k in ["Frog", "Bullfrog", "Wrestler Frog"]):
        sp_class = "Amphibia"
    elif any(k in name for k in ["Turtle", "Crocodile", "Alligator", "Dragon"]):
        sp_class = "Reptilia"
    elif any(k in name for k in ["Eagle", "Falcon", "Penguin", "Goose", "Heron", "Flamingo", "Turkey", "Ostrich", "Emu", "Owl", "Woodpecker", "sprpw", "Sparrow", "duck", "Duck", "Jay", "Greenlet", "Flatbill", "ko"]):
        sp_class = "Aves"
    elif name == "Guyalna cuta":
        sp_class = "Insecta"
    elif name in ["Spider", "spider"]:
        sp_class = "Arachnida"
    elif name == "p":
        sp_class = "Malacostraca"
    elif name == "sun":
        sp_class = "Magnoliopsida"
    else:
        sp_class = "Mammalia"

    # Resolve Order
    if sp_class == "Amphibia":
        sp_order = "Anura"
    elif sp_class == "Reptilia":
        if "Turtle" in name:
            sp_order = "Testudines"
        elif "Dragon" in name:
            sp_order = "Squamata"
        else:
            sp_order = "Crocodilia"
    elif sp_class == "Aves":
        if "Owl" in name:
            sp_order = "Strigiformes"
        elif any(k in name for k in ["Woodpecker"]):
            sp_order = "Piciformes"
        elif any(k in name for k in ["duck", "Duck", "Goose"]):
            sp_order = "Anseriformes"
        elif any(k in name for k in ["Falcon", "Eagle", "Osprey"]):
            sp_order = "Falconiformes" if "Falcon" in name else "Accipitriformes"
        elif any(k in name for k in ["Penguin"]):
            sp_order = "Sphenisciformes"
        elif any(k in name for k in ["Heron", "Flamingo"]):
            sp_order = "Pelecaniformes"
        elif any(k in name for k in ["Turkey"]):
            sp_order = "Galliformes"
        elif any(k in name for k in ["Ostrich"]):
            sp_order = "Struthioniformes"
        elif any(k in name for k in ["Emu"]):
            sp_order = "Casuariiformes"
        else:
            sp_order = "Passeriformes"
    elif sp_class == "Insecta":
        sp_order = "Hemiptera"
    elif sp_class == "Arachnida":
        sp_order = "Araneae"
    elif sp_class == "Malacostraca":
        sp_order = "Decapoda"
    elif sp_class == "Magnoliopsida":
        sp_order = "Asterales"
    else: # Mammalia
        if any(k in name for k in ["Elephant"]):
            sp_order = "Proboscidea"
        elif any(k in name for k in ["Chimpanzee", "Orangutan", "Gorilla", "Lemur"]):
            sp_order = "Primates"
        elif any(k in name for k in ["Squirrel"]):
            sp_order = "Rodentia"
        elif any(k in name for k in ["Rhinoceros", "Zebra"]):
            sp_order = "Perissodactyla"
        elif any(k in name for k in ["Koala", "Kangaroo"]):
            sp_order = "Diprotodontia"
        elif any(k in name for k in ["Platypus"]):
            sp_order = "Monotremata"
        elif any(k in name for k in ["Buffalo", "Wildebeest", "Impala", "Gazelle", "Boar", "Hippopotamus", "Giraffe"]):
            sp_order = "Artiodactyla"
        else:
            sp_order = "Carnivora"

    SEEDED_SPECIES.append({
        "common_name": name,
        "scientific_name": sci_name,
        "taxonomy": {"kingdom": "Animalia", "phylum": "Chordata", "class": sp_class, "order": sp_order, "family": family, "genus": genus, "species": sci_name.replace("_", " ")},
        "habitat": "Forests, Grasslands, Wetlands",
        "diet": diet,
        "lifespan": "10-20 years",
        "conservation_status": status,
        "population_trend": "Decreasing" if status in ["Endangered", "Vulnerable", "Critically Endangered"] else "Stable",
        "population_estimate": "Varying by local regions",
        "threat_level": "High" if status in ["Critically Endangered", "Endangered"] else "Medium" if status == "Vulnerable" else "Low",
        "native_regions": "Global Distribution",
        "interesting_facts": [f"The {name} plays a vital role in keeping local ecosystems balanced.", f"Detections of {name} help ecologists monitor forest density trends."],
        "wikipedia_link": f"https://en.wikipedia.org/wiki/{sci_name}",
        "iucn_link": "https://www.iucnredlist.org"
    })

def seed_species_table(db: Session) -> None:
    """
    Seeds target species definitions incrementally.
    """
    try:
        added = 0
        for sp in SEEDED_SPECIES:
            db_profile = db.query(SpeciesProfile).filter(
                (SpeciesProfile.common_name == sp["common_name"]) |
                (SpeciesProfile.scientific_name == sp["scientific_name"])
            ).first()
            if not db_profile:
                db_profile = SpeciesProfile(
                    common_name=sp["common_name"],
                    scientific_name=sp["scientific_name"],
                    taxonomy=sp["taxonomy"],
                    habitat=sp["habitat"],
                    diet=sp["diet"],
                    lifespan=sp["lifespan"],
                    conservation_status=sp["conservation_status"],
                    population_trend=sp["population_trend"],
                    population_estimate=sp["population_estimate"],
                    threat_level=sp["threat_level"],
                    native_regions=sp["native_regions"],
                    interesting_facts=sp["interesting_facts"],
                    wikipedia_link=sp["wikipedia_link"],
                    iucn_link=sp["iucn_link"]
                )
                db.add(db_profile)
                added += 1
            else:
                db_profile.taxonomy = sp["taxonomy"]
                db.add(db_profile)
        db.commit()
        logger.info(f"Successfully seeded/updated target species profiles (added {added}).")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to seed species database table: {str(e)}")
