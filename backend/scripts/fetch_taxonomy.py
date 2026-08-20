import argparse
import logging
import requests
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.database.database import SessionLocal, engine, Base
from app.models.taxonomy import Taxonomy

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Real species list provided by the user and their exact taxonomy details
REAL_TAXONOMY = {
    "Lion": {"scientific_name": "Panthera leo", "family": "Felidae", "genus": "Panthera", "habitat": "Savanna, Grassland", "diet": "Carnivore", "average_lifespan": "10-14 Years", "iucn_status": "Vulnerable"},
    "African Lion": {"scientific_name": "Panthera leo", "family": "Felidae", "genus": "Panthera", "habitat": "Savanna, Grassland", "diet": "Carnivore", "average_lifespan": "10-14 Years", "iucn_status": "Vulnerable"},
    "Tiger": {"scientific_name": "Panthera tigris", "family": "Felidae", "genus": "Panthera", "habitat": "Forest, Taiga", "diet": "Carnivore", "average_lifespan": "10-15 Years", "iucn_status": "Endangered"},
    "Bengal Tiger": {"scientific_name": "Panthera tigris tigris", "family": "Felidae", "genus": "Panthera", "habitat": "Forest, Taiga", "diet": "Carnivore", "average_lifespan": "10-15 Years", "iucn_status": "Endangered"},
    "Leopard": {"scientific_name": "Panthera pardus", "family": "Felidae", "genus": "Panthera", "habitat": "Forest, Savanna", "diet": "Carnivore", "average_lifespan": "12-17 Years", "iucn_status": "Vulnerable"},
    "Cheetah": {"scientific_name": "Acinonyx jubatus", "family": "Felidae", "genus": "Acinonyx", "habitat": "Savanna, Grassland", "diet": "Carnivore", "average_lifespan": "10-12 Years", "iucn_status": "Vulnerable"},
    "Elephant": {"scientific_name": "Loxodonta africana", "family": "Elephantidae", "genus": "Loxodonta", "habitat": "Savanna, Forest", "diet": "Herbivore", "average_lifespan": "60-70 Years", "iucn_status": "Endangered"},
    "African Elephant": {"scientific_name": "Loxodonta africana", "family": "Elephantidae", "genus": "Loxodonta", "habitat": "Savanna, Forest", "diet": "Herbivore", "average_lifespan": "60-70 Years", "iucn_status": "Endangered"},
    "White Rhinoceros": {"scientific_name": "Ceratotherium simum", "family": "Rhinocerotidae", "genus": "Ceratotherium", "habitat": "Grassland, Savanna", "diet": "Herbivore", "average_lifespan": "40-50 Years", "iucn_status": "Near Threatened"},
    "Black Rhinoceros": {"scientific_name": "Diceros bicornis", "family": "Rhinocerotidae", "genus": "Diceros", "habitat": "Grassland, Savanna", "diet": "Herbivore", "average_lifespan": "35-50 Years", "iucn_status": "Critically Endangered"},
    "Hippopotamus": {"scientific_name": "Hippopotamus amphibius", "family": "Hippopotamidae", "genus": "Hippopotamus", "habitat": "Rivers, Lakes", "diet": "Herbivore", "average_lifespan": "40-50 Years", "iucn_status": "Vulnerable"},
    "Buffalo": {"scientific_name": "Syncerus caffer", "family": "Bovidae", "genus": "Syncerus", "habitat": "Savanna, Forest", "diet": "Herbivore", "average_lifespan": "15-25 Years", "iucn_status": "Near Threatened"},
    "Zebra": {"scientific_name": "Equus quagga", "family": "Equidae", "genus": "Equus", "habitat": "Savanna, Grassland", "diet": "Herbivore", "average_lifespan": "20-30 Years", "iucn_status": "Near Threatened"},
    "Plains Zebra": {"scientific_name": "Equus quagga", "family": "Equidae", "genus": "Equus", "habitat": "Savanna, Grassland", "diet": "Herbivore", "average_lifespan": "20-30 Years", "iucn_status": "Near Threatened"},
    "Giraffe": {"scientific_name": "Giraffa camelopardalis", "family": "Giraffidae", "genus": "Giraffa", "habitat": "Savanna, Woodland", "diet": "Herbivore", "average_lifespan": "20-25 Years", "iucn_status": "Vulnerable"},
    "Masai Giraffe": {"scientific_name": "Giraffa camelopardalis tippelskirchi", "family": "Giraffidae", "genus": "Giraffa", "habitat": "Savanna, Woodland", "diet": "Herbivore", "average_lifespan": "20-25 Years", "iucn_status": "Vulnerable"},
    "Wolf": {"scientific_name": "Canis lupus", "family": "Canidae", "genus": "Canis", "habitat": "Forest, Tundra", "diet": "Carnivore", "average_lifespan": "6-8 Years", "iucn_status": "Least Concern"},
    "Gray Wolf": {"scientific_name": "Canis lupus", "family": "Canidae", "genus": "Canis", "habitat": "Forest, Tundra", "diet": "Carnivore", "average_lifespan": "6-8 Years", "iucn_status": "Least Concern"},
    "Fox": {"scientific_name": "Vulpes vulpes", "family": "Canidae", "genus": "Vulpes", "habitat": "Forest, Grassland", "diet": "Omnivore", "average_lifespan": "3-4 Years", "iucn_status": "Least Concern"},
    "Bear": {"scientific_name": "Ursus arctos", "family": "Ursidae", "genus": "Ursus", "habitat": "Forest, Tundra", "diet": "Omnivore", "average_lifespan": "20-30 Years", "iucn_status": "Least Concern"},
    "Monkey": {"scientific_name": "Macaca mulatta", "family": "Cercopithecidae", "genus": "Macaca", "habitat": "Forest", "diet": "Omnivore", "average_lifespan": "20-30 Years", "iucn_status": "Least Concern"},
    "Chimpanzee": {"scientific_name": "Pan troglodytes", "family": "Hominidae", "genus": "Pan", "habitat": "Forest, Savanna", "diet": "Omnivore", "average_lifespan": "40-50 Years", "iucn_status": "Endangered"},
    "Baboon": {"scientific_name": "Papio ursinus", "family": "Cercopithecidae", "genus": "Papio", "habitat": "Savanna, Grassland", "diet": "Omnivore", "average_lifespan": "20-30 Years", "iucn_status": "Least Concern"},
    "Crocodile": {"scientific_name": "Crocodylus niloticus", "family": "Crocodylidae", "genus": "Crocodylus", "habitat": "Rivers, Lakes", "diet": "Carnivore", "average_lifespan": "70-100 Years", "iucn_status": "Least Concern"},
    "Rabbit": {"scientific_name": "Oryctolagus cuniculus", "family": "Leporidae", "genus": "Oryctolagus", "habitat": "Grassland, Forest", "diet": "Herbivore", "average_lifespan": "9-12 Years", "iucn_status": "Endangered"},
    "Horse": {"scientific_name": "Equus ferus caballus", "family": "Equidae", "genus": "Equus", "habitat": "Grassland", "diet": "Herbivore", "average_lifespan": "25-30 Years", "iucn_status": "Not Evaluated"},
    "Dog": {"scientific_name": "Canis lupus familiaris", "family": "Canidae", "genus": "Canis", "habitat": "Domestic", "diet": "Omnivore", "average_lifespan": "10-13 Years", "iucn_status": "Not Evaluated"},
    "Cat": {"scientific_name": "Felis catus", "family": "Felidae", "genus": "Felis", "habitat": "Domestic", "diet": "Carnivore", "average_lifespan": "12-15 Years", "iucn_status": "Not Evaluated"},
    "Peacock": {"scientific_name": "Pavo cristatus", "family": "Phasianidae", "genus": "Pavo", "habitat": "Forest, Grassland", "diet": "Omnivore", "average_lifespan": "10-25 Years", "iucn_status": "Least Concern"},
    "African Fish Eagle": {"scientific_name": "Haliaeetus vocifer", "family": "Accipitridae", "genus": "Haliaeetus", "habitat": "Rivers, Lakes", "diet": "Carnivore", "average_lifespan": "12-24 Years", "iucn_status": "Least Concern"},
    "Hornbill": {"scientific_name": "Buceros bicornis", "family": "Bucerotidae", "genus": "Buceros", "habitat": "Forest", "diet": "Omnivore", "average_lifespan": "35-50 Years", "iucn_status": "Vulnerable"},
    "Owl": {"scientific_name": "Bubo bubo", "family": "Strigidae", "genus": "Bubo", "habitat": "Forest, Mountains", "diet": "Carnivore", "average_lifespan": "20-60 Years", "iucn_status": "Least Concern"},
    "Deer": {"scientific_name": "Cervus elaphus", "family": "Cervidae", "genus": "Cervus", "habitat": "Forest, Grassland", "diet": "Herbivore", "average_lifespan": "10-20 Years", "iucn_status": "Least Concern"}
}

def main():
    parser = argparse.ArgumentParser(description="Fetch taxonomy data and seed the Taxonomy database.")
    args = parser.parse_args()

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    logger.info(f"Seeding taxonomy for {len(REAL_TAXONOMY)} species...")
    
    for common_name, tax_data in REAL_TAXONOMY.items():
        existing = db.query(Taxonomy).filter(Taxonomy.common_name == common_name).first()
        if existing:
            logger.info(f"Species {common_name} already exists in DB. Skipping.")
            continue
            
        new_tax = Taxonomy(
            common_name=common_name,
            scientific_name=tax_data["scientific_name"],
            family=tax_data["family"],
            genus=tax_data["genus"],
            habitat=tax_data["habitat"],
            diet=tax_data["diet"],
            average_lifespan=tax_data["average_lifespan"],
            iucn_status=tax_data["iucn_status"],
            species_image=None,
            gbif_id=None
        )
        db.add(new_tax)
        try:
            db.commit()
            logger.info(f"Saved {common_name} to database.")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save {common_name}: {e}")
            
    db.close()
    logger.info("Taxonomy seeding complete.")

if __name__ == "__main__":
    main()
