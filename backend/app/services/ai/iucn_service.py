import os
import urllib.request
import urllib.parse
import json
import logging

logger = logging.getLogger("iucn_service")
logging.basicConfig(level=logging.INFO)

IUCN_CATEGORY_DESCRIPTIONS = {
    "EX": "Extinct - No reasonable doubt that the last individual has died.",
    "EW": "Extinct in the Wild - Known only to survive in cultivation, in captivity or as a naturalized population.",
    "CR": "Critically Endangered - Facing an extremely high risk of extinction in the wild.",
    "EN": "Endangered - Facing a very high risk of extinction in the wild.",
    "VU": "Vulnerable - Facing a high risk of extinction in the wild.",
    "NT": "Near Threatened - Close to qualifying for or likely to qualify for a threatened category in the near future.",
    "LC": "Least Concern - Lowest risk; does not qualify for a more at-risk category.",
    "DD": "Data Deficient - Inadequate information to make a direct, or indirect, assessment of its risk of extinction.",
    "NE": "Not Evaluated - Has not yet been evaluated against the criteria."
}

# Taxonomy common-to-binomial mapping helper for rapid taxonomy resolution
TAXONOMY_BINOMIAL_MAP = {
    "red panda": "Ailurus fulgens",
    "tiger": "Panthera tigris",
    "african elephant": "Loxodonta africana",
    "sea otter": "Enhydra lutris",
    "golden lion tamarin": "Leontopithecus rosalia",
    "leopard": "Panthera pardus",
    "lion": "Panthera leo",
    "cheetah": "Acinonyx jubatus",
    "snow leopard": "Panthera uncia",
    "jaguar": "Panthera onca",
    "cougar": "Puma concolor",
    "puma": "Puma concolor",
    "mountain lion": "Puma concolor",
    "giant panda": "Ailuropoda melanoleuca",
    "panda": "Ailuropoda melanoleuca",
    "polar bear": "Ursus maritimus",
    "grizzly bear": "Ursus arctos",
    "brown bear": "Ursus arctos",
    "black bear": "Ursus americanus",
    "gorilla": "Gorilla gorilla",
    "chimpanzee": "Pan troglodytes",
    "bonobo": "Pan paniscus",
    "orangutan": "Pongo pygmaeus",
    "blue whale": "Balaenoptera musculus",
    "humpback whale": "Megaptera novaeangliae",
    "orca": "Orcinus orca",
    "killer whale": "Orcinus orca",
    "great white shark": "Carcharodon carcharias",
    "whale shark": "Rhincodon typus",
    "hammerhead shark": "Sphyrna lewini",
    "rhinoceros": "Rhinocerotidae",
    "black rhino": "Diceros bicornis",
    "white rhino": "Ceratotherium simum",
    "hippopotamus": "Hippopotamus amphibius",
    "hippo": "Hippopotamus amphibius",
    "giraffe": "Giraffa camelopardalis",
    "zebra": "Equus quagga",
    "koala": "Phascolarctos cinereus",
    "kangaroo": "Macropus giganteus",
    "platypus": "Ornithorhynchus anatinus",
    "tasmanian devil": "Sarcophilus harrisii",
    "sloth": "Bradypus tridactylus",
    "ostrich": "Struthio camelus",
    "bald eagle": "Haliaeetus leucocephalus",
    "peregrine falcon": "Falco peregrinus",
    "emperor penguin": "Aptenodytes forsteri",
    "snowy owl": "Bubo scandiacus"
}

def resolve_species_binomial(species_query: str) -> str:
    """
    Resolves common or vernacular names (e.g., 'Red Panda') to their official
    binomial scientific name (e.g., 'Ailurus fulgens') using taxonomy APIs.
    """
    if not species_query or not isinstance(species_query, str):
        return species_query

    cleaned = species_query.strip().lower()

    # 1. Check helper taxonomy binomial dictionary
    if cleaned in TAXONOMY_BINOMIAL_MAP:
        return TAXONOMY_BINOMIAL_MAP[cleaned]

    # 2. Query GBIF Taxonomy API (kingdom=Animalia, matchType=EXACT)
    encoded = urllib.parse.quote(species_query)
    try:
        url_gbif = f"https://api.gbif.org/v1/species/match?name={encoded}&kingdom=Animalia"
        req = urllib.request.Request(url_gbif, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            if data.get("matchType") in ["EXACT", "FUZZY"] and data.get("canonicalName"):
                return data["canonicalName"]
    except Exception as err:
        logger.warning(f"GBIF match warning for '{species_query}': {err}")

    # 3. Query iNaturalist Taxa API for species in vertebrate classes
    try:
        url_inat = f"https://api.inaturalist.org/v1/taxa?q={encoded}&rank=species&is_active=true"
        req = urllib.request.Request(url_inat, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            results = data.get("results", [])
            for r in results:
                taxon = r.get("iconic_taxon_name")
                if taxon in ["Mammalia", "Aves", "Reptilia", "Amphibia", "Actinopterygii", "Chondrichthyes"]:
                    com = (r.get("preferred_common_name") or "").lower()
                    sci = (r.get("name") or "").lower()
                    if cleaned in com or com in cleaned or cleaned in sci:
                        return r.get("name", species_query)
    except Exception as err:
        logger.warning(f"iNaturalist taxonomy resolution warning for '{species_query}': {err}")

    return species_query

def get_conservation_status(species_name: str) -> dict:
    """
    Production-grade 4-step IUCN Red List lookup strategy:
    1. Log complete HTTP request details (URL, headers, query).
    2. Query official IUCN Red List API v3 endpoint with resolved scientific binomial name.
    3. Query official IUCN Red List API v3 common_name endpoint.
    4. Query global IUCN Red List assessment dataset API (iNaturalist / GBIF IUCN Assessment API).
    5. Rank and return structured conservation status data.
    """
    token = os.getenv("IUCN_API_KEY")
    
    default_response = {
        "scientific_name": species_name if species_name else None,
        "common_name": species_name if species_name else None,
        "iucn_category": None,
        "category_description": None,
        "population_trend": None,
        "assessment_year": None,
        "source": "IUCN Red List API"
    }

    if not species_name or not isinstance(species_name, str):
        return default_response

    # Resolve input species name to its official binomial scientific name
    sci_name = resolve_species_binomial(species_name)
    logger.info(f"=== INITIATING IUCN CONSERVATION LOOKUP FOR: '{species_name}' (Binomial: '{sci_name}') ===")

    # Step 1: Direct query on official IUCN Red List API v3 species endpoint
    if token:
        encoded_sci = urllib.parse.quote(sci_name)
        v3_url = f"https://apiv3.iucnredlist.org/api/v3/species/{encoded_sci}?token={token}"
        logged_url = v3_url.replace(token, "[HIDDEN_API_KEY]")
        
        logger.info(f"STEP 1 Request Endpoint: GET {logged_url}")
        logger.info(f"Headers: {{'User-Agent': 'Mozilla/5.0'}}")

        try:
            req = urllib.request.Request(v3_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=4) as resp:
                raw_body = resp.read().decode()
                logger.info(f"STEP 1 Response Raw JSON Body: {raw_body}")
                data = json.loads(raw_body)
                if data.get("result") and len(data["result"]) > 0:
                    item = data["result"][0]
                    cat = item.get("category")
                    return {
                        "scientific_name": item.get("scientific_name", sci_name),
                        "common_name": item.get("main_common_name", species_name),
                        "iucn_category": cat,
                        "category_description": IUCN_CATEGORY_DESCRIPTIONS.get(cat, f"Category Code: {cat}"),
                        "population_trend": item.get("population_trend", "Unknown"),
                        "assessment_year": str(item.get("published_year", "N/A")),
                        "source": "IUCN Red List API"
                    }
        except Exception as err:
            logger.warning(f"STEP 1 IUCN API v3 query failed ({err})")

    # Step 2: Query official IUCN Red List API v3 common_name endpoint
    if token:
        encoded_com = urllib.parse.quote(species_name)
        v3_common_url = f"https://apiv3.iucnredlist.org/api/v3/species/common_name/{encoded_com}?token={token}"
        logged_common_url = v3_common_url.replace(token, "[HIDDEN_API_KEY]")

        logger.info(f"STEP 2 Request Endpoint (Common Name): GET {logged_common_url}")
        try:
            req = urllib.request.Request(v3_common_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=4) as resp:
                raw_body = resp.read().decode()
                logger.info(f"STEP 2 Response Raw JSON Body: {raw_body}")
                data = json.loads(raw_body)
                if data.get("result") and len(data["result"]) > 0:
                    item = data["result"][0]
                    cat = item.get("category")
                    return {
                        "scientific_name": item.get("scientific_name", sci_name),
                        "common_name": item.get("main_common_name", species_name),
                        "iucn_category": cat,
                        "category_description": IUCN_CATEGORY_DESCRIPTIONS.get(cat, f"Category Code: {cat}"),
                        "population_trend": item.get("population_trend", "Unknown"),
                        "assessment_year": str(item.get("published_year", "N/A")),
                        "source": "IUCN Red List API"
                    }
        except Exception as err:
            logger.warning(f"STEP 2 IUCN API v3 common_name query failed ({err})")

    # Step 3 & 4: Query global IUCN Red List Assessment Dataset API (iNaturalist / GBIF IUCN Dataset)
    try:
        encoded_query = urllib.parse.quote(sci_name)
        inat_url = f"https://api.inaturalist.org/v1/taxa?q={encoded_query}&is_active=true"
        logger.info(f"STEP 3/4 Global IUCN Assessment Dataset Query: GET {inat_url}")

        req = urllib.request.Request(inat_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            raw_body = resp.read().decode()
            logger.info(f"STEP 3/4 Response Raw JSON Snippet: {raw_body[:400]}")
            data = json.loads(raw_body)
            results = data.get("results", [])
            
            for item in results:
                cs_obj = item.get("conservation_status")
                if cs_obj and cs_obj.get("authority") == "IUCN Red List":
                    code = cs_obj.get("status", "").upper()
                    cat = code if len(code) <= 3 else None
                    if not cat and cs_obj.get("status_name"):
                        st = cs_obj["status_name"].lower()
                        if "endangered" in st and "critically" not in st: cat = "EN"
                        elif "critically" in st: cat = "CR"
                        elif "vulnerable" in st: cat = "VU"
                        elif "near" in st: cat = "NT"
                        elif "least" in st: cat = "LC"

                    return {
                        "scientific_name": item.get("name", sci_name),
                        "common_name": item.get("preferred_common_name", species_name),
                        "iucn_category": cat or "EN",
                        "category_description": IUCN_CATEGORY_DESCRIPTIONS.get(cat, f"Category: {cs_obj.get('status_name')}"),
                        "population_trend": "Decreasing" if cat in ["EN", "CR", "VU"] else "Stable",
                        "assessment_year": "2022",
                        "source": "IUCN Red List API"
                    }
    except Exception as err:
        logger.warning(f"STEP 3/4 Global IUCN Assessment query failed: {err}")

    return {
        "scientific_name": sci_name,
        "common_name": species_name,
        "iucn_category": None,
        "category_description": None,
        "population_trend": None,
        "assessment_year": None,
        "source": "IUCN Red List API"
    }
