import logging
import random
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.monitoring_site import MonitoringSite
from app.models.survey import Survey
from app.models.observation import Observation
from app.models.species import Species
from app.models.image_detection import ImageDetection
from app.models.audio_detection import AudioDetection
from app.models.species_record import SpeciesRecord
from app.models.population import PopulationStatistic, PopulationTrend, PopulationDensity
from app.models.habitat import HabitatAnalysis, HabitatRisk, MigrationCorridor
from app.models.conservation import ConservationRecommendation
from app.models.ecosystem import EcosystemHealth

logger = logging.getLogger(__name__)

def seed_complete_database(db: Session) -> None:
    logger.info("Starting complete database check and seeding...")

    # 0. Ensure Admin & Researcher User exist
    researcher_user = db.query(User).filter(User.email == "researcher@example.com").first()
    if not researcher_user:
        researcher_user = User(
            full_name="Dr. Jane Goodall",
            email="researcher@example.com",
            password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW", # hashed password for 'password123'
            role="wildlife_researcher",
            is_active=True
        )
        db.add(researcher_user)
        db.commit()
        db.refresh(researcher_user)

    user_id = researcher_user.id

    # 1. Seed Species (if empty)
    if db.query(Species).count() < 10:
        species_defs = [
            ("African Elephant", "Loxodonta africana", "Mammal", "Vulnerable"),
            ("Bengal Tiger", "Panthera tigris tigris", "Mammal", "Endangered"),
            ("African Lion", "Panthera leo", "Mammal", "Vulnerable"),
            ("Leopard", "Panthera pardus", "Mammal", "Vulnerable"),
            ("Hippopotamus", "Hippopotamus amphibius", "Mammal", "Vulnerable"),
            ("Giraffe", "Giraffa camelopardalis", "Mammal", "Vulnerable"),
            ("Zebra", "Equus quagga", "Mammal", "Least Concern"),
            ("Black Rhino", "Diceros bicornis", "Mammal", "Critically Endangered"),
            ("White Rhino", "Ceratotherium simum", "Mammal", "Near Threatened"),
            ("African Buffalo", "Syncerus caffer", "Mammal", "Least Concern"),
            ("African Fish Eagle", "Haliaeetus vocifer", "Bird", "Least Concern"),
            ("Great Hornbill", "Buceros bicornis", "Bird", "Vulnerable")
        ]
        for name, scientific_name, category, iucn_status in species_defs:
            if not db.query(Species).filter(Species.common_name == name).first():
                db.add(Species(common_name=name, scientific_name=scientific_name, category=category, iucn_status=iucn_status))
        db.commit()

    species_list = db.query(Species).all()
    species_map = {s.common_name: s.id for s in species_list}

    # 2. Seed Sites (4 Sites required)
    if db.query(MonitoringSite).count() < 4:
        logger.info("Seeding 4 Monitoring Sites...")
        sites_data = [
            MonitoringSite(site_name="Riverbank Transect", latitude=-2.3333, longitude=34.8333, habitat="Riparian Wetland", country="Tanzania"),
            MonitoringSite(site_name="Savanna Loop", latitude=-2.8500, longitude=34.5000, habitat="Acacia Woodland", country="Tanzania"),
            MonitoringSite(site_name="Misty Ridge Corridor", latitude=-1.4700, longitude=29.4000, habitat="Montane Forest", country="Rwanda"),
            MonitoringSite(site_name="Tiger Watch Sanctuary", latitude=21.9400, longitude=89.1800, habitat="Mangrove Forest", country="India"),
        ]
        db.add_all(sites_data)
        db.commit()

    sites = db.query(MonitoringSite).all()
    site_map = {s.site_name: s.id for s in sites}

    # 3. Seed Surveys (10 Surveys required)
    if db.query(Survey).count() < 10:
        logger.info("Seeding 10 Surveys...")
        survey_defs = [
            ("Riverbank Transect", date(2026, 7, 10), "Camera Trap v2", "High activity near riverbank during dawn monitoring."),
            ("Riverbank Transect", date(2026, 7, 11), "Acoustic Sensor R1", "Recording audio calls along northern stream."),
            ("Savanna Loop", date(2026, 7, 11), "Acoustic Sensor A1", "Prairie wind and repeated calls from distant raptors."),
            ("Savanna Loop", date(2026, 7, 12), "Camera Trap S2", "Herd movement observed near acacia grove."),
            ("Misty Ridge Corridor", date(2026, 7, 12), "Trail Camera Pro", "Dense forest signs of hornbill nesting activity."),
            ("Misty Ridge Corridor", date(2026, 7, 13), "Acoustic Array M3", "High frequency primate vocalization detected."),
            ("Tiger Watch Sanctuary", date(2026, 7, 13), "Wildlife Drone X", "Tiger-like movement pattern observed near mangrove edge."),
            ("Tiger Watch Sanctuary", date(2026, 7, 14), "Camera Trap T1", "Nocturnal camera capture of apex predators."),
            ("Riverbank Transect", date(2026, 7, 15), "Hydrophone H1", "Aquatic hippo vocalizations recorded."),
            ("Savanna Loop", date(2026, 7, 16), "Thermal Drone T2", "Night thermal survey over southern savanna sector.")
        ]
        for site_name, s_date, dev, rem in survey_defs:
            s_id = site_map.get(site_name, sites[0].id)
            db.add(Survey(site_id=s_id, user_id=user_id, survey_date=s_date, device=dev, remarks=rem))
        db.commit()

    # 4. Seed Observations (50 Observations required)
    if db.query(Observation).count() < 50:
        logger.info("Seeding 50 Observation records...")
        obs_species_names = ["African Elephant", "Bengal Tiger", "African Lion", "Leopard", "Hippopotamus", "Giraffe", "Zebra", "Black Rhino", "African Fish Eagle", "Great Hornbill"]
        obs_sites = list(site_map.keys())
        
        obs_records = []
        for i in range(1, 51):
            sp_name = obs_species_names[i % len(obs_species_names)]
            st_name = obs_sites[i % len(obs_sites)]
            sp_id = species_map.get(sp_name, species_list[0].id)
            st_id = site_map.get(st_name, sites[0].id)
            obs_records.append(
                Observation(
                    species_id=sp_id,
                    site_id=st_id,
                    observation_date=date(2026, 7, (i % 25) + 1),
                    count=(i % 8) + 1
                )
            )
        db.add_all(obs_records)
        db.commit()

    # Seed templates
    img_templates = [
        ("African Elephant", "Loxodonta africana", "Mammalia", "Elephantidae", "Savanna North", "Herbivore", "60 years", "Vulnerable", "uploads/demo-elephant.jpg"),
        ("Bengal Tiger", "Panthera tigris tigris", "Mammalia", "Felidae", "Coastal Mangrove", "Carnivore", "15 years", "Endangered", "uploads/demo-tiger.jpg"),
        ("African Lion", "Panthera leo", "Mammalia", "Felidae", "Savanna South", "Carnivore", "14 years", "Vulnerable", "uploads/demo-lion.jpg"),
        ("Leopard", "Panthera pardus", "Mammalia", "Felidae", "Mixed Woodland", "Carnivore", "12 years", "Vulnerable", "uploads/demo-leopard.jpg"),
        ("Hippopotamus", "Hippopotamus amphibius", "Mammalia", "Hippopotamidae", "River Delta", "Herbivore", "40 years", "Vulnerable", "uploads/demo-hippo.jpg"),
        ("Giraffe", "Giraffa camelopardalis", "Mammalia", "Giraffidae", "Grassland Zone", "Herbivore", "25 years", "Vulnerable", "uploads/demo-giraffe.jpg"),
        ("Zebra", "Equus quagga", "Mammalia", "Equidae", "Grassland Zone", "Herbivore", "20 years", "Least Concern", "uploads/demo-zebra.jpg"),
        ("Black Rhino", "Diceros bicornis", "Mammalia", "Rhinocerotidae", "Mountain Forest", "Herbivore", "45 years", "Critically Endangered", "uploads/demo-rhino.jpg"),
        ("African Fish Eagle", "Haliaeetus vocifer", "Aves", "Accipitridae", "River Delta", "Carnivore", "20 years", "Least Concern", "uploads/demo-eagle.jpg"),
        ("Great Hornbill", "Buceros bicornis", "Aves", "Bucerotidae", "Rainforest Core", "Frugivore", "35 years", "Vulnerable", "uploads/demo-hornbill.jpg")
    ]

    audio_templates = [
        ("African Fish Eagle", "Haliaeetus vocifer", "Aves", "Accipitridae", "River Delta", "12.5s", "2400 Hz", "uploads/demo-eagle.wav"),
        ("Bengal Tiger", "Panthera tigris tigris", "Mammalia", "Felidae", "Coastal Mangrove", "8.0s", "450 Hz", "uploads/demo-tiger-call.wav"),
        ("African Lion", "Panthera leo", "Mammalia", "Felidae", "Savanna South", "15.2s", "320 Hz", "uploads/demo-lion-roar.wav"),
        ("Hippopotamus", "Hippopotamus amphibius", "Mammalia", "Hippopotamidae", "River Delta", "20.0s", "180 Hz", "uploads/demo-hippo-grunt.wav"),
        ("Chimpanzee", "Pan troglodytes", "Mammalia", "Hominidae", "Rainforest Core", "14.5s", "1200 Hz", "uploads/demo-chimp-call.wav"),
        ("Great Hornbill", "Buceros bicornis", "Aves", "Bucerotidae", "Misty Ridge Corridor", "9.6s", "850 Hz", "uploads/demo-hornbill-call.wav")
    ]

    # 5. Seed Species Recognition History (75 ImageDetections across Jan-Jul 2026)
    if db.query(ImageDetection).count() < 60:
        logger.info("Seeding 75 Species Recognition Image Detections spanning Jan-Jul 2026...")
        db.query(ImageDetection).delete()
        db.commit()
        img_detections = []
        
        # Historical months (Jan to Jun 2026): 35 detections
        months_hist = [1, 2, 3, 4, 5, 6]
        for idx in range(35):
            t = img_templates[idx % len(img_templates)]
            m = months_hist[idx % len(months_hist)]
            d = (idx % 28) + 1
            det_date = f"2026-{m:02d}-{d:02d}"
            det_time = f"{(idx * 3) % 24:02d}:{(idx * 7) % 60:02d}:15"
            conf_val = round(0.80 + ((idx * 7) % 20) * 0.0095, 2) # between 0.80 and 0.99
            img_detections.append(
                ImageDetection(
                    user_id=user_id,
                    image_path=t[8],
                    species=t[0],
                    scientific_name=t[1],
                    family=t[3],
                    genus=t[1].split()[0],
                    habitat=t[4],
                    diet=t[5],
                    lifespan=t[6],
                    status=t[7],
                    confidence=str(conf_val),
                    bounding_box="120,80,450,380",
                    annotated_image_path=t[8],
                    crop_image_path=t[8],
                    thumbnail_path=t[8],
                    location=f"{t[4]} Sector {(idx % 4) + 1}",
                    detection_date=det_date,
                    detection_time=det_time,
                    inference_time="0.042s"
                )
            )
            
        # Daily July 2026 detections (July 1 to July 30): 45 detections (at least 1-3 per day)
        for day in range(1, 31):
            num_dets = 2 if day % 2 == 0 else 1
            for k in range(num_dets):
                idx = day * 2 + k
                t = img_templates[idx % len(img_templates)]
                det_date = f"2026-07-{day:02d}"
                det_time = f"{(k * 6 + day) % 24:02d}:{(k * 15 + day * 3) % 60:02d}:00"
                conf_val = round(0.82 + ((day + k * 5) % 18) * 0.0095, 2) # 0.82 to 0.99
                img_detections.append(
                    ImageDetection(
                        user_id=user_id,
                        image_path=t[8],
                        species=t[0],
                        scientific_name=t[1],
                        family=t[3],
                        genus=t[1].split()[0],
                        habitat=t[4],
                        diet=t[5],
                        lifespan=t[6],
                        status=t[7],
                        confidence=str(conf_val),
                        bounding_box="120,80,450,380",
                        annotated_image_path=t[8],
                        crop_image_path=t[8],
                        thumbnail_path=t[8],
                        location=f"{t[4]} Sector {(k % 4) + 1}",
                        detection_date=det_date,
                        detection_time=det_time,
                        inference_time="0.038s"
                    )
                )

        db.add_all(img_detections)
        db.commit()

    # 6. Seed Audio Recognition History (46 AudioDetections across Jan-Jul 2026)
    if db.query(AudioDetection).count() < 40:
        logger.info("Seeding 46 Audio Recognition Detections spanning Jan-Jul 2026...")
        db.query(AudioDetection).delete()
        db.commit()
        audio_detections = []
        
        # Historical months (Jan to Jun 2026): 20 detections
        for idx in range(20):
            t = audio_templates[idx % len(audio_templates)]
            m = (idx % 6) + 1
            d = (idx % 28) + 1
            det_date = f"2026-{m:02d}-{d:02d}"
            det_time = f"{(idx * 4) % 24:02d}:{(idx * 9) % 60:02d}:30"
            conf_val = round(0.81 + ((idx * 8) % 18) * 0.01, 2)
            audio_detections.append(
                AudioDetection(
                    user_id=user_id,
                    audio_path=t[7],
                    species=t[0],
                    scientific_name=t[1],
                    family=t[3],
                    genus=t[1].split()[0],
                    habitat=t[4],
                    diet="Carnivore/Omnivore",
                    lifespan="20 years",
                    status="Observed",
                    confidence=str(conf_val),
                    waveform_path=t[7],
                    spectrogram_path=t[7],
                    thumbnail_path=t[7],
                    location=f"{t[4]} Sensor Array {(idx % 3) + 1}",
                    detection_date=det_date,
                    detection_time=det_time,
                    inference_time="0.038s",
                    duration=t[5],
                    sample_rate="22050 Hz",
                    frequency=t[6],
                    dominant_frequency=t[6]
                )
            )

        # Daily July 2026 detections (July 1 to July 30): 30 detections
        for day in range(1, 31):
            t = audio_templates[day % len(audio_templates)]
            det_date = f"2026-07-{day:02d}"
            det_time = f"{(day * 5) % 24:02d}:{(day * 11) % 60:02d}:45"
            conf_val = round(0.84 + (day % 15) * 0.01, 2)
            audio_detections.append(
                AudioDetection(
                    user_id=user_id,
                    audio_path=t[7],
                    species=t[0],
                    scientific_name=t[1],
                    family=t[3],
                    genus=t[1].split()[0],
                    habitat=t[4],
                    diet="Carnivore/Omnivore",
                    lifespan="20 years",
                    status="Observed",
                    confidence=str(conf_val),
                    waveform_path=t[7],
                    spectrogram_path=t[7],
                    thumbnail_path=t[7],
                    location=f"{t[4]} Sensor Array {(day % 3) + 1}",
                    detection_date=det_date,
                    detection_time=det_time,
                    inference_time="0.035s",
                    duration=t[5],
                    sample_rate="22050 Hz",
                    frequency=t[6],
                    dominant_frequency=t[6]
                )
            )

        db.add_all(audio_detections)
        db.commit()

    # 7. Seed Biodiversity Records (15 SpeciesRecords required)
    if db.query(SpeciesRecord).count() < 15:
        logger.info("Seeding 15 Biodiversity Species Records...")
        biodiversity_defs = [
            ("African Elephant", "Loxodonta africana", "Elephantidae", "Loxodonta", "Savanna North", "Vulnerable", 0.95),
            ("Bengal Tiger", "Panthera tigris tigris", "Felidae", "Panthera", "Coastal Mangrove", "Endangered", 0.94),
            ("African Lion", "Panthera leo", "Felidae", "Panthera", "Savanna South", "Vulnerable", 0.98),
            ("Leopard", "Panthera pardus", "Felidae", "Panthera", "Mixed Woodland", "Vulnerable", 0.92),
            ("Hippopotamus", "Hippopotamus amphibius", "Hippopotamidae", "Hippopotamus", "River Delta", "Vulnerable", 0.95),
            ("Giraffe", "Giraffa camelopardalis", "Giraffidae", "Giraffa", "Grassland Zone", "Vulnerable", 0.96),
            ("Zebra", "Equus quagga", "Equidae", "Equus", "Grassland Zone", "Least Concern", 0.97),
            ("Black Rhino", "Diceros bicornis", "Rhinocerotidae", "Diceros", "Mountain Forest", "Critically Endangered", 0.99),
            ("White Rhino", "Ceratotherium simum", "Rhinocerotidae", "Ceratotherium", "Grassland Zone", "Near Threatened", 0.95),
            ("African Buffalo", "Syncerus caffer", "Bovidae", "Syncerus", "Wetland Alpha", "Least Concern", 0.94),
            ("African Fish Eagle", "Haliaeetus vocifer", "Accipitridae", "Haliaeetus", "River Delta", "Least Concern", 0.93),
            ("Great Hornbill", "Buceros bicornis", "Bucerotidae", "Buceros", "Rainforest Core", "Vulnerable", 0.91),
            ("Cheetah", "Acinonyx jubatus", "Felidae", "Acinonyx", "Savanna South", "Vulnerable", 0.90),
            ("Snow Leopard", "Panthera uncia", "Felidae", "Panthera", "Alpine Meadow", "Vulnerable", 0.88),
            ("Mountain Gorilla", "Gorilla beringei beringei", "Hominidae", "Gorilla", "Mountain Forest", "Endangered", 0.96)
        ]
        bio_records = [
            SpeciesRecord(
                common_name=cn, scientific_name=sn, family=fam, genus=gen, habitat=hab, status=st, confidence=conf
            ) for cn, sn, fam, gen, hab, st, conf in biodiversity_defs
        ]
        db.add_all(bio_records)
        db.commit()

    # 8. Seed Population Intelligence (12+ Records required)
    if db.query(PopulationStatistic).count() < 12:
        logger.info("Seeding 12+ Population Intelligence records...")
        from app.database.seed_m3 import seed_milestone3_data
        seed_milestone3_data(db)

    # 9. Seed Habitat Intelligence (8+ Records required)
    if db.query(HabitatAnalysis).count() < 8:
        logger.info("Seeding 8+ Habitat Intelligence records...")
        from app.database.seed_m3 import seed_milestone3_data
        seed_milestone3_data(db)

    # 10. Seed Conservation Recommendations (10+ Records required)
    if db.query(ConservationRecommendation).count() < 10:
        logger.info("Seeding 10+ Conservation Recommendations...")
        from app.database.seed_m3 import seed_milestone3_data
        seed_milestone3_data(db)

    # 12. Run Deterministic Intelligence Engine Recalculation
    try:
        from app.services.intelligence_engine import recalculate_all_intelligence
        recalculate_all_intelligence(db)
    except Exception as e:
        logger.warning("Intelligence recalculation failed during seed: %s", e)

    logger.info("Complete SQLite database verification & seeding finished successfully.")
