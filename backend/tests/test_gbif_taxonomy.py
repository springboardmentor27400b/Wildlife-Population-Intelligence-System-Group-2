import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai.taxonomy_service import get_gbif_taxonomy, _taxonomy_cache
from app.services.ai.iucn_service import get_conservation_status

def test_gbif_taxonomy_scientific_name():
    _taxonomy_cache.clear()
    res = get_gbif_taxonomy("Panthera tigris")
    assert res is not None
    assert "Panthera tigris" in res["scientific_name"]
    assert res["kingdom"] == "Animalia"
    assert res["phylum"] == "Chordata"
    assert res["class"] == "Mammalia"
    assert res["order"] == "Carnivora"
    assert res["family"] == "Felidae"
    assert res["genus"] == "Panthera"
    assert res["species"] == "Panthera tigris"

@pytest.mark.parametrize("species_name,expected_genus,expected_species", [
    ("Tiger", "Panthera", "Panthera tigris"),
    ("Leopard", "Panthera", "Panthera pardus"),
    ("Red Panda", "Ailurus", "Ailurus fulgens"),
    ("African Elephant", "Loxodonta", "Loxodonta africana"),
    ("Golden Lion Tamarin", "Leontopithecus", "Leontopithecus rosalia"),
    ("Sea Otter", "Enhydra", "Enhydra lutris"),
])
def test_validation_species_iucn_to_gbif_pipeline(species_name, expected_genus, expected_species):
    # 1. Fetch IUCN Status
    iucn_data = get_conservation_status(species_name)
    iucn_sci_name = iucn_data.get("scientific_name")
    assert iucn_sci_name is not None
    
    # Priority 1: Send IUCN scientific name to GBIF
    res = get_gbif_taxonomy(iucn_sci_name)
    assert res is not None
    assert res["kingdom"] == "Animalia"
    assert res["phylum"] == "Chordata"
    assert res["class"] == "Mammalia"
    assert res["genus"] == expected_genus
    assert res["species"] == expected_species

def test_gbif_taxonomy_caching():
    _taxonomy_cache.clear()
    res1 = get_gbif_taxonomy("Loxodonta africana")
    assert "loxodonta africana" in _taxonomy_cache
    res2 = get_gbif_taxonomy("Loxodonta africana")
    assert res1 == res2

def test_gbif_taxonomy_graceful_fail():
    res = get_gbif_taxonomy("NonExistentSpecies12345XYZ")
    assert res is None
