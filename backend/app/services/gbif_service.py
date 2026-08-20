import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Simple in-memory cache to prevent repetitive GBIF REST API calls
_GBIF_CACHE: Dict[str, Dict[str, Any]] = {}

# Fallback local taxonomy dictionary
LOCAL_TAXONOMY_FALLBACK: Dict[str, Dict[str, Any]] = {
    "African Elephant": {
        "scientific_name": "Loxodonta africana",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class_name": "Mammalia",
        "order_name": "Proboscidea",
        "family": "Elephantidae",
        "genus": "Loxodonta",
        "species": "Loxodonta africana",
        "iucn_status": "Vulnerable",
        "gbif_id": 2435422
    },
    "Bengal Tiger": {
        "scientific_name": "Panthera tigris tigris",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class_name": "Mammalia",
        "order_name": "Carnivora",
        "family": "Felidae",
        "genus": "Panthera",
        "species": "Panthera tigris",
        "iucn_status": "Endangered",
        "gbif_id": 5219426
    },
    "African Lion": {
        "scientific_name": "Panthera leo",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class_name": "Mammalia",
        "order_name": "Carnivora",
        "family": "Felidae",
        "genus": "Panthera",
        "species": "Panthera leo",
        "iucn_status": "Vulnerable",
        "gbif_id": 5219404
    },
    "Leopard": {
        "scientific_name": "Panthera pardus",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class_name": "Mammalia",
        "order_name": "Carnivora",
        "family": "Felidae",
        "genus": "Panthera",
        "species": "Panthera pardus",
        "iucn_status": "Vulnerable",
        "gbif_id": 5219436
    },
    "African Fish Eagle": {
        "scientific_name": "Haliaeetus vocifer",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class_name": "Aves",
        "order_name": "Accipitriformes",
        "family": "Accipitridae",
        "genus": "Haliaeetus",
        "species": "Haliaeetus vocifer",
        "iucn_status": "Least Concern",
        "gbif_id": 2480456
    },
    "Great Hornbill": {
        "scientific_name": "Buceros bicornis",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class_name": "Aves",
        "order_name": "Bucerotiformes",
        "family": "Bucerotidae",
        "genus": "Buceros",
        "species": "Buceros bicornis",
        "iucn_status": "Vulnerable",
        "gbif_id": 2476020
    }
}


def fetch_gbif_taxonomy(name: str) -> Dict[str, Any]:
    """
    Fetches official species taxonomy metadata from the GBIF REST API with caching,
    timeout handling, and seamless fallback to local REAL_TAXONOMY mapping.
    """
    clean_name = name.strip()
    cache_key = clean_name.lower()

    if cache_key in _GBIF_CACHE:
        logger.info(f"GBIF cache hit for '{clean_name}'")
        return _GBIF_CACHE[cache_key]

    gbif_url = "https://api.gbif.org/v1/species/match"
    params = {"name": clean_name, "verbose": "true"}

    try:
        logger.info(f"Querying GBIF REST API for '{clean_name}'...")
        response = requests.get(gbif_url, params=params, timeout=4.0)

        if response.status_code == 200:
            data = response.json()
            match_type = data.get("matchType")

            if match_type in ["EXACT", "FUZZY"]:
                result = {
                    "common_name": clean_name,
                    "scientific_name": data.get("scientificName") or data.get("species") or clean_name,
                    "kingdom": data.get("kingdom", "Animalia"),
                    "phylum": data.get("phylum", "Chordata"),
                    "class_name": data.get("class", "Mammalia"),
                    "order_name": data.get("order", "Carnivora"),
                    "family": data.get("family", "Unknown"),
                    "genus": data.get("genus", "Unknown"),
                    "species": data.get("species") or data.get("canonicalName") or clean_name,
                    "gbif_id": data.get("usageKey") or data.get("speciesKey"),
                    "match_type": match_type,
                    "confidence": data.get("confidence", 90),
                    "source": "GBIF_API"
                }
                _GBIF_CACHE[cache_key] = result
                logger.info(f"GBIF API lookup successful for '{clean_name}' (usageKey: {result['gbif_id']})")
                return result
    except Exception as e:
        logger.warning(f"GBIF REST API network query failed for '{clean_name}': {e}. Falling back to local taxonomy.")

    # Fallback logic
    fallback = LOCAL_TAXONOMY_FALLBACK.get(clean_name, {
        "common_name": clean_name,
        "scientific_name": f"{clean_name} sp.",
        "kingdom": "Animalia",
        "phylum": "Chordata",
        "class_name": "Mammalia",
        "order_name": "Wild",
        "family": "Fauna",
        "genus": clean_name.split()[0] if clean_name else "Unknown",
        "species": clean_name,
        "gbif_id": None,
        "source": "LOCAL_FALLBACK"
    })
    
    _GBIF_CACHE[cache_key] = fallback
    return fallback
