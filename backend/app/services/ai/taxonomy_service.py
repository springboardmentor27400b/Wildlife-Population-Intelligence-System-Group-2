import json
import logging
import urllib.request
import urllib.parse
from typing import Optional, Dict, Any

logger = logging.getLogger("taxonomy_service")
logging.basicConfig(level=logging.INFO)

# In-memory cache for taxonomy results
_taxonomy_cache: Dict[str, Dict[str, Any]] = {}

def get_gbif_taxonomy(species_name: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves the complete taxonomic hierarchy from the GBIF Species API.
    Supports both Scientific Names (e.g., 'Panthera tigris') and Common Names (e.g., 'Red Panda').
    Uses lightweight in-memory caching to avoid redundant external network requests.
    Never raises exceptions or crashes the calling process.
    """
    if not species_name or not isinstance(species_name, str):
        return None

    clean_name = species_name.strip()
    cache_key = clean_name.lower()

    # Skip non-species placeholders
    if cache_key in ["unknown", "none", "background", "no animal detected", "n/a"]:
        return None

    # Check cache first
    if cache_key in _taxonomy_cache:
        logger.info("Returning cached taxonomy for species: '%s'", clean_name)
        return _taxonomy_cache[cache_key]

    gbif_data = None
    resolved_sciname = None
    enc_name = urllib.parse.quote(clean_name)

    # 1. Attempt direct GBIF Species Match (Optimized for scientific names)
    url_match = f"https://api.gbif.org/v1/species/match?name={enc_name}&verbose=true"
    try:
        req = urllib.request.Request(url_match, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get("matchType") != "NONE" and data.get("usageKey"):
                gbif_data = data
    except Exception as err:
        logger.warning("GBIF direct species match failed for '%s': %s", clean_name, err)

    # 2. If direct match returned NONE (common name provided), resolve common name -> scientific name
    if not gbif_data:
        url_inat = f"https://api.inaturalist.org/v1/taxa?q={enc_name}&is_active=true"
        try:
            req = urllib.request.Request(url_inat, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as resp:
                inat_data = json.loads(resp.read().decode('utf-8'))
                results = inat_data.get("results", [])
                if results:
                    top = results[0]
                    resolved_sciname = top.get("name")
        except Exception as err:
            logger.warning("Taxon resolution failed for common name '%s': %s", clean_name, err)

        if resolved_sciname:
            enc_sci = urllib.parse.quote(resolved_sciname)
            url_match_sci = f"https://api.gbif.org/v1/species/match?name={enc_sci}&verbose=true"
            try:
                req = urllib.request.Request(url_match_sci, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=6) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    if data.get("matchType") != "NONE" and data.get("usageKey"):
                        gbif_data = data
            except Exception as err:
                logger.warning("GBIF match for resolved scientific name '%s' failed: %s", resolved_sciname, err)

    if not gbif_data:
        logger.info("No GBIF taxonomic classification found for '%s'", clean_name)
        return None

    # 3. Format complete taxonomic hierarchy payload
    sc_name = gbif_data.get("scientificName") or resolved_sciname or clean_name
    canonical = gbif_data.get("species") or gbif_data.get("canonicalName") or sc_name.split('(')[0].strip()

    taxonomy_result = {
        "scientific_name": sc_name,
        "kingdom": gbif_data.get("kingdom") or "Animalia",
        "phylum": gbif_data.get("phylum") or "Chordata",
        "class": gbif_data.get("class") or "Mammalia",
        "order": gbif_data.get("order") or "N/A",
        "family": gbif_data.get("family") or "N/A",
        "genus": gbif_data.get("genus") or "N/A",
        "species": canonical
    }

    # Store in memory cache
    _taxonomy_cache[cache_key] = taxonomy_result
    logger.info("Successfully resolved and cached GBIF taxonomy for '%s' -> '%s'", clean_name, taxonomy_result["scientific_name"])

    return taxonomy_result
