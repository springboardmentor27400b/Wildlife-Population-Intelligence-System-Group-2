import os
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Force UTF-8 output encoding for Windows terminal compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.image_detection import ImageDetection
from app.models.audio_detection import AudioDetection
from app.models.species_record import SpeciesRecord

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

DEMO_SPECIES = [
    {"common": "African Elephant", "scientific": "Loxodonta africana", "family": "Elephantidae", "genus": "Loxodonta", "habitat": "Savanna", "status": "Endangered"},
    {"common": "Bengal Tiger", "scientific": "Panthera tigris tigris", "family": "Felidae", "genus": "Panthera", "habitat": "Tropical Forest", "status": "Endangered"},
    {"common": "African Lion", "scientific": "Panthera leo", "family": "Felidae", "genus": "Panthera", "habitat": "Savanna", "status": "Vulnerable"},
    {"common": "Leopard", "scientific": "Panthera pardus", "family": "Felidae", "genus": "Panthera", "habitat": "Forest & Savanna", "status": "Vulnerable"},
    {"common": "Cheetah", "scientific": "Acinonyx jubatus", "family": "Felidae", "genus": "Acinonyx", "habitat": "Grassland", "status": "Vulnerable"},
    {"common": "Plains Zebra", "scientific": "Equus quagga", "family": "Equidae", "genus": "Equus", "habitat": "Savanna", "status": "Near Threatened"},
    {"common": "Masai Giraffe", "scientific": "Giraffa camelopardalis tippelskirchi", "family": "Giraffidae", "genus": "Giraffa", "habitat": "Savanna", "status": "Vulnerable"},
    {"common": "African Buffalo", "scientific": "Syncerus caffer", "family": "Bovidae", "genus": "Syncerus", "habitat": "Savanna", "status": "Least Concern"},
    {"common": "White Rhinoceros", "scientific": "Ceratotherium simum", "family": "Rhinocerotidae", "genus": "Ceratotherium", "habitat": "Grassland", "status": "Near Threatened"},
    {"common": "Hippopotamus", "scientific": "Hippopotamus amphibius", "family": "Hippopotamidae", "genus": "Hippopotamus", "habitat": "Rivers & Lakes", "status": "Vulnerable"},
    {"common": "Spotted Hyena", "scientific": "Crocuta crocuta", "family": "Hyaenidae", "genus": "Crocuta", "habitat": "Savanna", "status": "Least Concern"},
    {"common": "African Wild Dog", "scientific": "Lycaon pictus", "family": "Canidae", "genus": "Lycaon", "habitat": "Savanna & Woodland", "status": "Endangered"},
    {"common": "Nile Crocodile", "scientific": "Crocodylus niloticus", "family": "Crocodylidae", "genus": "Crocodylus", "habitat": "Freshwater", "status": "Least Concern"},
    {"common": "Ostrich", "scientific": "Struthio camelus", "family": "Struthionidae", "genus": "Struthio", "habitat": "Savanna", "status": "Least Concern"},
    {"common": "African Fish Eagle", "scientific": "Haliaeetus vocifer", "family": "Accipitridae", "genus": "Haliaeetus", "habitat": "Wetlands", "status": "Least Concern"},
    {"common": "Indian Peacock", "scientific": "Pavo cristatus", "family": "Phasianidae", "genus": "Pavo", "habitat": "Forest & Woodland", "status": "Least Concern"},
    {"common": "Snow Leopard", "scientific": "Panthera uncia", "family": "Felidae", "genus": "Panthera", "habitat": "Alpine Mountains", "status": "Vulnerable"},
    {"common": "Red Panda", "scientific": "Ailurus fulgens", "family": "Ailuridae", "genus": "Ailurus", "habitat": "Temperate Forest", "status": "Endangered"},
    {"common": "Asian Elephant", "scientific": "Elephas maximus", "family": "Elephantidae", "genus": "Elephas", "habitat": "Tropical Forest", "status": "Endangered"},
    {"common": "Chimpanzee", "scientific": "Pan troglodytes", "family": "Hominidae", "genus": "Pan", "habitat": "Rainforest", "status": "Endangered"},
]

LOCATIONS = [
    "Serengeti National Park",
    "Kaziranga National Park",
    "Ranthambore National Park",
    "Kruger National Park",
    "Yellowstone National Park",
    "Amazon Rainforest",
    "Western Ghats",
    "Sundarbans",
    "Gir National Park",
    "Bandipur National Park",
]


def seed_demo_data():
    db = SessionLocal()
    try:
        print("[*] Starting Wildlife Population Intelligence System Demo Data Seeder...")

        # 1. Ensure a Demo User exists
        user = db.query(User).filter_by(email="demo_researcher@wildlife.org").first()
        if not user:
            user = User(
                full_name="Dr. Sarah Jenkins",
                email="demo_researcher@wildlife.org",
                password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E/T38F6jHwQvYQ1n1Z11Z11Z11Z11Z",
                role="wildlife_researcher",
                created_at=datetime.now(timezone.utc) - timedelta(days=365)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"[+] Created demo user: {user.full_name} ({user.email})")
        else:
            print(f"[-] Found existing user: {user.full_name}")

        user_id = user.id

        # 2. Seed Species Records (20 items)
        existing_species_count = db.query(SpeciesRecord).count()
        if existing_species_count < 20:
            print(f"[*] Seeding species records (current count: {existing_species_count})...")
            records_to_add = []
            for item in DEMO_SPECIES:
                if not db.query(SpeciesRecord).filter_by(common_name=item["common"]).first():
                    record = SpeciesRecord(
                        common_name=item["common"],
                        scientific_name=item["scientific"],
                        family=item["family"],
                        genus=item["genus"],
                        habitat=item["habitat"],
                        status=item["status"],
                        confidence=round(random.uniform(0.88, 0.98), 2),
                        created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(30, 300))
                    )
                    records_to_add.append(record)
            if records_to_add:
                db.add_all(records_to_add)
                db.commit()
                print(f"[+] Successfully added {len(records_to_add)} species records.")
        else:
            print(f"[-] Species records table already populated ({existing_species_count} records). Skipping.")

        # 3. Seed Image Detections (25+ items)
        existing_image_count = db.query(ImageDetection).count()
        if existing_image_count < 25:
            print(f"[*] Seeding image detections (current count: {existing_image_count})...")
            images_to_add = []
            needed_count = max(0, 25 - existing_image_count)

            for i in range(needed_count):
                sp = random.choice(DEMO_SPECIES)
                loc = random.choice(LOCATIONS)
                days_ago = random.randint(1, 350)
                timestamp = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 23))
                conf = round(random.uniform(0.80, 0.99), 2)

                x1, y1 = random.randint(10, 100), random.randint(10, 100)
                x2, y2 = x1 + random.randint(200, 400), y1 + random.randint(150, 350)

                slug = sp["common"].lower().replace(" ", "_")
                img_path = f"uploads/images/{slug}_{i+1}.jpg"

                detection = ImageDetection(
                    user_id=user_id,
                    image_path=img_path,
                    species=sp["common"],
                    confidence=str(conf),
                    bounding_box=f"{x1},{y1},{x2},{y2}",
                    location=loc,
                    created_at=timestamp
                )
                images_to_add.append(detection)

            db.add_all(images_to_add)
            db.commit()
            print(f"[+] Successfully added {len(images_to_add)} image detections.")
        else:
            print(f"[-] Image detections table already populated ({existing_image_count} records). Skipping.")

        # 4. Seed Audio Detections (15+ items)
        existing_audio_count = db.query(AudioDetection).count()
        if existing_audio_count < 15:
            print(f"[*] Seeding bioacoustic audio detections (current count: {existing_audio_count})...")
            audio_to_add = []
            needed_audio = max(0, 15 - existing_audio_count)

            audio_species = [s for s in DEMO_SPECIES if s["common"] in [
                "African Fish Eagle", "African Elephant", "Bengal Tiger", "African Lion",
                "Indian Peacock", "Chimpanzee", "Leopard", "Spotted Hyena"
            ]] or DEMO_SPECIES

            for i in range(needed_audio):
                sp = random.choice(audio_species)
                days_ago = random.randint(1, 350)
                timestamp = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 23))
                conf = round(random.uniform(0.82, 0.97), 2)
                duration_sec = round(random.uniform(2.5, 12.0), 1)
                freq_khz = round(random.uniform(0.8, 4.5), 1)

                slug = sp["common"].lower().replace(" ", "_")
                ext = ".wav" if i % 2 == 0 else ".mp3"
                audio_path = f"uploads/audio/{slug}_call_{i+1}{ext}"

                detection = AudioDetection(
                    user_id=user_id,
                    audio_path=audio_path,
                    species=sp["common"],
                    confidence=str(conf),
                    duration=f"{duration_sec}s",
                    frequency=f"{freq_khz}kHz",
                    created_at=timestamp
                )
                audio_to_add.append(detection)

            db.add_all(audio_to_add)
            db.commit()
            print(f"[+] Successfully added {len(audio_to_add)} audio detections.")
        else:
            print(f"[-] Audio detections table already populated ({existing_audio_count} records). Skipping.")

        # Final Summary
        total_img = db.query(ImageDetection).count()
        total_aud = db.query(AudioDetection).count()
        total_sp = db.query(SpeciesRecord).count()

        print("\n========================================================")
        print("DEMO DATA SEEDING COMPLETE")
        print("========================================================")
        print(f"[*] Image Detections  : {total_img} records")
        print(f"[*] Audio Detections  : {total_aud} records")
        print(f"[*] Species Records   : {total_sp} records")
        print(f"[*] Demo User         : Dr. Sarah Jenkins (user_id={user_id})")
        print("========================================================\n")

    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding demo data: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
