import logging
from datetime import date
from sqlalchemy.orm import Session

from app.models.population import PopulationStatistic, PopulationTrend, PopulationDensity
from app.models.habitat import HabitatAnalysis, HabitatRisk, MigrationCorridor
from app.models.conservation import ConservationRecommendation
from app.models.ecosystem import EcosystemHealth

logger = logging.getLogger(__name__)

def seed_milestone3_data(db: Session) -> None:
    # 1. Seed Population Statistics
    if db.query(PopulationStatistic).count() == 0:
        logger.info("Seeding Population Statistics sample data...")
        pop_records = [
            # 1. African Elephant
            PopulationStatistic(
                species="African Elephant", species_name="African Elephant", common_name="African Elephant",
                scientific_name="Loxodonta africana", habitat="Savanna North", location="Serengeti National Park",
                protected_area="Serengeti Conservation Area", survey_date="2026-06-15", recorded_date=date(2026, 6, 15),
                previous_population=148, estimated_count=156, current_population=156, growth_rate=5.4,
                birth_rate=7.2, mortality_rate=1.8, migration_rate=0.5, population_status="Increasing",
                confidence_score=0.95, male_count=52, female_count=70, juvenile_count=34, adult_count=122,
                density_per_km2=0.31, habitat_area_km2=500.0
            ),
            # 2. Bengal Tiger
            PopulationStatistic(
                species="Bengal Tiger", species_name="Bengal Tiger", common_name="Bengal Tiger",
                scientific_name="Panthera tigris tigris", habitat="Coastal Mangrove", location="Sundarbans Reserve",
                protected_area="Sundarbans Sanctuary", survey_date="2026-06-10", recorded_date=date(2026, 6, 10),
                previous_population=46, estimated_count=42, current_population=42, growth_rate=-8.7,
                birth_rate=2.1, mortality_rate=10.8, migration_rate=0.0, population_status="Declining",
                confidence_score=0.92, male_count=14, female_count=20, juvenile_count=8, adult_count=34,
                density_per_km2=0.14, habitat_area_km2=300.0
            ),
            # 3. African Lion
            PopulationStatistic(
                species="African Lion", species_name="African Lion", common_name="African Lion",
                scientific_name="Panthera leo", habitat="Savanna South", location="Maasai Mara",
                protected_area="Maasai Reserve", survey_date="2026-06-12", recorded_date=date(2026, 6, 12),
                previous_population=87, estimated_count=88, current_population=88, growth_rate=1.2,
                birth_rate=4.5, mortality_rate=3.3, migration_rate=0.2, population_status="Stable",
                confidence_score=0.94, male_count=26, female_count=44, juvenile_count=18, adult_count=70,
                density_per_km2=0.22, habitat_area_km2=400.0
            ),
            # 4. Leopard
            PopulationStatistic(
                species="Leopard", species_name="Leopard", common_name="Leopard",
                scientific_name="Panthera pardus", habitat="Mixed Woodland", location="Kruger National Park",
                protected_area="Kruger Sector 4", survey_date="2026-06-08", recorded_date=date(2026, 6, 8),
                previous_population=67, estimated_count=67, current_population=67, growth_rate=0.0,
                birth_rate=3.0, mortality_rate=3.0, migration_rate=0.0, population_status="Stable",
                confidence_score=0.91, male_count=22, female_count=30, juvenile_count=15, adult_count=52,
                density_per_km2=0.19, habitat_area_km2=350.0
            ),
            # 5. Hippopotamus
            PopulationStatistic(
                species="Hippopotamus", species_name="Hippopotamus", common_name="Hippopotamus",
                scientific_name="Hippopotamus amphibius", habitat="River Delta", location="Luangwa River Delta",
                protected_area="Luangwa Sanctuary", survey_date="2026-06-05", recorded_date=date(2026, 6, 5),
                previous_population=202, estimated_count=210, current_population=210, growth_rate=3.8,
                birth_rate=5.5, mortality_rate=1.7, migration_rate=0.0, population_status="Increasing",
                confidence_score=0.93, male_count=70, female_count=100, juvenile_count=40, adult_count=170,
                density_per_km2=1.05, habitat_area_km2=200.0
            ),
            # 6. Giraffe
            PopulationStatistic(
                species="Giraffe", species_name="Giraffe", common_name="Giraffe",
                scientific_name="Giraffa camelopardalis", habitat="Grassland Zone", location="Tsavo Conservation Area",
                protected_area="Tsavo East", survey_date="2026-06-14", recorded_date=date(2026, 6, 14),
                previous_population=119, estimated_count=124, current_population=124, growth_rate=4.1,
                birth_rate=5.8, mortality_rate=1.7, migration_rate=0.0, population_status="Increasing",
                confidence_score=0.96, male_count=40, female_count=58, juvenile_count=26, adult_count=98,
                density_per_km2=0.28, habitat_area_km2=450.0
            ),
            # 7. Zebra
            PopulationStatistic(
                species="Zebra", species_name="Zebra", common_name="Zebra",
                scientific_name="Equus quagga", habitat="Grassland Zone", location="Serengeti Plains",
                protected_area="Serengeti Central", survey_date="2026-06-16", recorded_date=date(2026, 6, 16),
                previous_population=437, estimated_count=450, current_population=450, growth_rate=2.9,
                birth_rate=6.0, mortality_rate=3.1, migration_rate=1.2, population_status="Increasing",
                confidence_score=0.97, male_count=150, female_count=210, juvenile_count=90, adult_count=360,
                density_per_km2=0.75, habitat_area_km2=600.0
            ),
            # 8. Black Rhino
            PopulationStatistic(
                species="Black Rhino", species_name="Black Rhino", common_name="Black Rhino",
                scientific_name="Diceros bicornis", habitat="Mountain Forest", location="Ngorongoro Crater",
                protected_area="Ngorongoro Sanctuary", survey_date="2026-06-01", recorded_date=date(2026, 6, 1),
                previous_population=29, estimated_count=28, current_population=28, growth_rate=-2.1,
                birth_rate=3.4, mortality_rate=5.5, migration_rate=0.0, population_status="Critical",
                confidence_score=0.98, male_count=9, female_count=14, juvenile_count=5, adult_count=23,
                density_per_km2=0.11, habitat_area_km2=250.0
            ),
            # 9. White Rhino
            PopulationStatistic(
                species="White Rhino", species_name="White Rhino", common_name="White Rhino",
                scientific_name="Ceratotherium simum", habitat="Grassland Zone", location="Hluhluwe Reserve",
                protected_area="Hluhluwe Sector A", survey_date="2026-06-03", recorded_date=date(2026, 6, 3),
                previous_population=63, estimated_count=64, current_population=64, growth_rate=1.8,
                birth_rate=4.2, mortality_rate=2.4, migration_rate=0.0, population_status="Stable",
                confidence_score=0.95, male_count=20, female_count=32, juvenile_count=12, adult_count=52,
                density_per_km2=0.21, habitat_area_km2=300.0
            ),
            # 10. African Buffalo
            PopulationStatistic(
                species="African Buffalo", species_name="African Buffalo", common_name="African Buffalo",
                scientific_name="Syncerus caffer", habitat="Wetland Alpha", location="Chobe National Park",
                protected_area="Chobe Riverbank", survey_date="2026-06-18", recorded_date=date(2026, 6, 18),
                previous_population=364, estimated_count=380, current_population=380, growth_rate=4.5,
                birth_rate=7.0, mortality_rate=2.5, migration_rate=0.5, population_status="Increasing",
                confidence_score=0.94, male_count=120, female_count=180, juvenile_count=80, adult_count=300,
                density_per_km2=0.95, habitat_area_km2=400.0
            ),
            # 11. Cheetah
            PopulationStatistic(
                species="Cheetah", species_name="Cheetah", common_name="Cheetah",
                scientific_name="Acinonyx jubatus", habitat="Savanna South", location="Kalahari Reserve",
                protected_area="Kalahari North", survey_date="2026-06-04", recorded_date=date(2026, 6, 4),
                previous_population=37, estimated_count=35, current_population=35, growth_rate=-4.2,
                birth_rate=3.0, mortality_rate=7.2, migration_rate=0.0, population_status="Declining",
                confidence_score=0.90, male_count=12, female_count=16, juvenile_count=7, adult_count=28,
                density_per_km2=0.07, habitat_area_km2=500.0
            ),
            # 12. Snow Leopard
            PopulationStatistic(
                species="Snow Leopard", species_name="Snow Leopard", common_name="Snow Leopard",
                scientific_name="Panthera uncia", habitat="Alpine Meadow", location="Himalayan Sanctuary",
                protected_area="High Altitude Park", survey_date="2026-06-02", recorded_date=date(2026, 6, 2),
                previous_population=19, estimated_count=19, current_population=19, growth_rate=0.5,
                birth_rate=2.5, mortality_rate=2.0, migration_rate=0.0, population_status="Stable",
                confidence_score=0.88, male_count=6, female_count=9, juvenile_count=4, adult_count=15,
                density_per_km2=0.04, habitat_area_km2=450.0
            ),
            # 13. Mountain Gorilla
            PopulationStatistic(
                species="Mountain Gorilla", species_name="Mountain Gorilla", common_name="Mountain Gorilla",
                scientific_name="Gorilla beringei beringei", habitat="Mountain Forest", location="Virunga Massif",
                protected_area="Virunga National Park", survey_date="2026-06-07", recorded_date=date(2026, 6, 7),
                previous_population=51, estimated_count=53, current_population=53, growth_rate=3.1,
                birth_rate=4.8, mortality_rate=1.7, migration_rate=0.0, population_status="Increasing",
                confidence_score=0.96, male_count=18, female_count=24, juvenile_count=11, adult_count=42,
                density_per_km2=0.35, habitat_area_km2=150.0
            ),
            # 14. Chimpanzee
            PopulationStatistic(
                species="Chimpanzee", species_name="Chimpanzee", common_name="Chimpanzee",
                scientific_name="Pan troglodytes", habitat="Rainforest Core", location="Gombe Stream",
                protected_area="Gombe Reserve", survey_date="2026-06-09", recorded_date=date(2026, 6, 9),
                previous_population=75, estimated_count=76, current_population=76, growth_rate=1.0,
                birth_rate=3.5, mortality_rate=2.5, migration_rate=0.0, population_status="Stable",
                confidence_score=0.93, male_count=24, female_count=36, juvenile_count=16, adult_count=60,
                density_per_km2=0.42, habitat_area_km2=180.0
            ),
            # 15. Polar Bear
            PopulationStatistic(
                species="Polar Bear", species_name="Polar Bear", common_name="Polar Bear",
                scientific_name="Ursus maritimus", habitat="Coastal Ice", location="Svalbard Archipelago",
                protected_area="Arctic Marine Reserve", survey_date="2026-05-28", recorded_date=date(2026, 5, 28),
                previous_population=33, estimated_count=31, current_population=31, growth_rate=-6.5,
                birth_rate=2.0, mortality_rate=8.5, migration_rate=0.0, population_status="Declining",
                confidence_score=0.89, male_count=10, female_count=14, juvenile_count=7, adult_count=24,
                density_per_km2=0.03, habitat_area_km2=1000.0
            ),
            # 16. Jaguar
            PopulationStatistic(
                species="Jaguar", species_name="Jaguar", common_name="Jaguar",
                scientific_name="Panthera onca", habitat="Wetland Beta", location="Pantanal Wetlands",
                protected_area="Pantanal Reserve", survey_date="2026-06-11", recorded_date=date(2026, 6, 11),
                previous_population=47, estimated_count=48, current_population=48, growth_rate=2.2,
                birth_rate=4.0, mortality_rate=1.8, migration_rate=0.0, population_status="Increasing",
                confidence_score=0.91, male_count=16, female_count=22, juvenile_count=10, adult_count=38,
                density_per_km2=0.16, habitat_area_km2=300.0
            ),
            # 17. Red Panda
            PopulationStatistic(
                species="Red Panda", species_name="Red Panda", common_name="Red Panda",
                scientific_name="Ailurus fulgens", habitat="Bamboo Forest", location="Eastern Himalayas",
                protected_area="Singalila National Park", survey_date="2026-06-06", recorded_date=date(2026, 6, 6),
                previous_population=23, estimated_count=22, current_population=22, growth_rate=-3.0,
                birth_rate=2.8, mortality_rate=5.8, migration_rate=0.0, population_status="Declining",
                confidence_score=0.87, male_count=7, female_count=10, juvenile_count=5, adult_count=17,
                density_per_km2=0.18, habitat_area_km2=120.0
            ),
            # 18. Blue Whale
            PopulationStatistic(
                species="Blue Whale", species_name="Blue Whale", common_name="Blue Whale",
                scientific_name="Balaenoptera musculus", habitat="Coastal Waters", location="Southern Ocean Sanctuary",
                protected_area="Antarctic Marine Sanctuary", survey_date="2026-05-30", recorded_date=date(2026, 5, 30),
                previous_population=15, estimated_count=15, current_population=15, growth_rate=1.5,
                birth_rate=2.0, mortality_rate=0.5, migration_rate=0.0, population_status="Stable",
                confidence_score=0.85, male_count=5, female_count=7, juvenile_count=3, adult_count=12,
                density_per_km2=0.01, habitat_area_km2=1500.0
            ),
            # 19. Sea Otter
            PopulationStatistic(
                species="Sea Otter", species_name="Sea Otter", common_name="Sea Otter",
                scientific_name="Enhydra lutris", habitat="Kelped Coast", location="Monterey Bay",
                protected_area="Monterey Marine Reserve", survey_date="2026-06-13", recorded_date=date(2026, 6, 13),
                previous_population=88, estimated_count=92, current_population=92, growth_rate=4.8,
                birth_rate=6.5, mortality_rate=1.7, migration_rate=0.0, population_status="Increasing",
                confidence_score=0.94, male_count=30, female_count=42, juvenile_count=20, adult_count=72,
                density_per_km2=0.92, habitat_area_km2=100.0
            ),
            # 20. African Wild Dog
            PopulationStatistic(
                species="African Wild Dog", species_name="African Wild Dog", common_name="African Wild Dog",
                scientific_name="Lycaon pictus", habitat="River Delta", location="Okavango Delta",
                protected_area="Moremi Game Reserve", survey_date="2026-06-02", recorded_date=date(2026, 6, 2),
                previous_population=31, estimated_count=29, current_population=29, growth_rate=-5.0,
                birth_rate=3.5, mortality_rate=8.5, migration_rate=0.0, population_status="Critical",
                confidence_score=0.92, male_count=9, female_count=13, juvenile_count=7, adult_count=22,
                density_per_km2=0.10, habitat_area_km2=290.0
            ),
        ]
        db.add_all(pop_records)
        db.commit()

    # 2. Seed Monthly Population Trends
    if db.query(PopulationTrend).count() == 0:
        logger.info("Seeding Population Trends...")
        trends_records = []
        species_list = ["African Elephant", "Bengal Tiger", "African Lion", "Leopard", "Zebra"]
        base_counts = [140, 48, 82, 64, 420]
        growth_factors = [1.015, 0.99, 1.008, 1.002, 1.012]
        for m in range(1, 13):
            for i, sp in enumerate(species_list):
                cnt = int(base_counts[i] * (growth_factors[i] ** m))
                trends_records.append(
                    PopulationTrend(species=sp, month=m, year=2026, count=cnt, growth_rate=round((growth_factors[i] - 1) * 100, 2))
                )
        db.add_all(trends_records)
        db.commit()

    # 3. Seed Habitat Analysis (15 records)
    if db.query(HabitatAnalysis).count() == 0:
        logger.info("Seeding Habitat Analysis sample data...")
        habitat_records = [
            HabitatAnalysis(habitat_name="Savanna North", region="Northern Sector", location="Serengeti", quality_score=91.0, suitability_score=91.0, water_availability=88.0, vegetation_density=85.0, temperature_celsius=27.5, temperature=27.5, humidity=60.0, food_availability=90.0, human_disturbance=12.0, pollution_index=8.0, fire_risk=15.0, habitat_quality=91.0, risk_level="Low", species_count=14, latitude=-2.33, longitude=34.83, area_km2=500.0),
            HabitatAnalysis(habitat_name="Savanna South", region="Southern Sector", location="Maasai Mara", quality_score=83.0, suitability_score=83.0, water_availability=75.0, vegetation_density=80.0, temperature_celsius=29.0, temperature=29.0, humidity=55.0, food_availability=82.0, human_disturbance=22.0, pollution_index=14.0, fire_risk=25.0, habitat_quality=83.0, risk_level="Low", species_count=12, latitude=-3.12, longitude=35.10, area_km2=400.0),
            HabitatAnalysis(habitat_name="River Delta", region="Luangwa Basin", location="Luangwa Valley", quality_score=74.0, suitability_score=74.0, water_availability=95.0, vegetation_density=90.0, temperature_celsius=25.0, temperature=25.0, humidity=80.0, food_availability=88.0, human_disturbance=38.0, pollution_index=25.0, fire_risk=10.0, habitat_quality=74.0, risk_level="Medium", species_count=18, latitude=-13.10, longitude=31.80, area_km2=200.0),
            HabitatAnalysis(habitat_name="Grassland Zone", region="Central Corridor", location="Serengeti Plains", quality_score=51.0, suitability_score=51.0, water_availability=45.0, vegetation_density=50.0, temperature_celsius=31.2, temperature=31.2, humidity=40.0, food_availability=55.0, human_disturbance=62.0, pollution_index=45.0, fire_risk=65.0, habitat_quality=51.0, risk_level="High", species_count=9, latitude=-2.85, longitude=34.50, area_km2=600.0),
            HabitatAnalysis(habitat_name="Mountain Forest", region="Virunga Range", location="Virunga Volcanoes", quality_score=88.0, suitability_score=88.0, water_availability=90.0, vegetation_density=94.0, temperature_celsius=16.4, temperature=16.4, humidity=85.0, food_availability=92.0, human_disturbance=15.0, pollution_index=10.0, fire_risk=5.0, habitat_quality=88.0, risk_level="Low", species_count=11, latitude=-1.47, longitude=29.40, area_km2=250.0),
            HabitatAnalysis(habitat_name="Wetland Alpha", region="Okavango Upper", location="Okavango Delta", quality_score=86.0, suitability_score=86.0, water_availability=98.0, vegetation_density=88.0, temperature_celsius=24.5, temperature=24.5, humidity=78.0, food_availability=91.0, human_disturbance=18.0, pollution_index=12.0, fire_risk=8.0, habitat_quality=86.0, risk_level="Low", species_count=16, latitude=-19.30, longitude=22.80, area_km2=400.0),
            HabitatAnalysis(habitat_name="Wetland Beta", region="Pantanal Reserve", location="Pantanal Basin", quality_score=68.0, suitability_score=68.0, water_availability=82.0, vegetation_density=75.0, temperature_celsius=28.1, temperature=28.1, humidity=72.0, food_availability=78.0, human_disturbance=45.0, pollution_index=32.0, fire_risk=30.0, habitat_quality=68.0, risk_level="Medium", species_count=15, latitude=-17.40, longitude=-56.60, area_km2=300.0),
            HabitatAnalysis(habitat_name="Rainforest Core", region="Congo Basin East", location="Ituri Forest", quality_score=94.0, suitability_score=94.0, water_availability=96.0, vegetation_density=98.0, temperature_celsius=23.8, temperature=23.8, humidity=92.0, food_availability=96.0, human_disturbance=8.0, pollution_index=5.0, fire_risk=2.0, habitat_quality=94.0, risk_level="Low", species_count=22, latitude=0.45, longitude=25.20, area_km2=800.0),
            HabitatAnalysis(habitat_name="Desert Edge", region="Kalahari Fringe", location="Kalahari Basin", quality_score=38.0, suitability_score=38.0, water_availability=20.0, vegetation_density=25.0, temperature_celsius=36.5, temperature=36.5, humidity=25.0, food_availability=30.0, human_disturbance=58.0, pollution_index=50.0, fire_risk=80.0, habitat_quality=38.0, risk_level="Critical", species_count=5, latitude=-24.50, longitude=21.40, area_km2=500.0),
            HabitatAnalysis(habitat_name="Mixed Woodland", region="Kruger Hinterland", location="Kruger Park", quality_score=78.0, suitability_score=78.0, water_availability=70.0, vegetation_density=72.0, temperature_celsius=26.2, temperature=26.2, humidity=62.0, food_availability=76.0, human_disturbance=30.0, pollution_index=20.0, fire_risk=35.0, habitat_quality=78.0, risk_level="Medium", species_count=13, latitude=-24.00, longitude=31.50, area_km2=350.0),
            HabitatAnalysis(habitat_name="Coastal Mangrove", region="Sundarbans West", location="Sundarbans Delta", quality_score=42.0, suitability_score=42.0, water_availability=85.0, vegetation_density=65.0, temperature_celsius=30.1, temperature=30.1, humidity=88.0, food_availability=50.0, human_disturbance=74.0, pollution_index=68.0, fire_risk=10.0, habitat_quality=42.0, risk_level="High", species_count=7, latitude=21.94, longitude=89.18, area_km2=300.0),
            HabitatAnalysis(habitat_name="Alpine Meadow", region="Himalayan Divide", location="Annapurna Sector", quality_score=62.0, suitability_score=62.0, water_availability=60.0, vegetation_density=40.0, temperature_celsius=8.5, temperature=8.5, humidity=50.0, food_availability=58.0, human_disturbance=25.0, pollution_index=15.0, fire_risk=20.0, habitat_quality=62.0, risk_level="Medium", species_count=6, latitude=28.60, longitude=83.90, area_km2=450.0),
            HabitatAnalysis(habitat_name="Rift Valley", region="Great Rift Sector", location="Lake Nakuru", quality_score=29.0, suitability_score=29.0, water_availability=30.0, vegetation_density=35.0, temperature_celsius=33.0, temperature=33.0, humidity=38.0, food_availability=32.0, human_disturbance=82.0, pollution_index=75.0, fire_risk=70.0, habitat_quality=29.0, risk_level="Critical", species_count=4, latitude=-0.50, longitude=36.10, area_km2=280.0),
            HabitatAnalysis(habitat_name="Bamboo Forest", region="Sichuan Basin", location="Min Mountains", quality_score=71.0, suitability_score=71.0, water_availability=78.0, vegetation_density=82.0, temperature_celsius=18.0, temperature=18.0, humidity=75.0, food_availability=70.0, human_disturbance=40.0, pollution_index=28.0, fire_risk=15.0, habitat_quality=71.0, risk_level="Medium", species_count=8, latitude=30.60, longitude=103.20, area_km2=120.0),
            HabitatAnalysis(habitat_name="Scrubland West", region="Western Kalahari", location="Ghanzi District", quality_score=55.0, suitability_score=55.0, water_availability=40.0, vegetation_density=48.0, temperature_celsius=32.4, temperature=32.4, humidity=42.0, food_availability=52.0, human_disturbance=52.0, pollution_index=38.0, fire_risk=60.0, habitat_quality=55.0, risk_level="High", species_count=8, latitude=-22.10, longitude=18.50, area_km2=320.0),
        ]
        db.add_all(habitat_records)
        db.commit()

    # 3b. Seed Population Densities (if empty)
    if db.query(PopulationDensity).count() == 0:
        logger.info("Seeding Population Densities...")
        density_records = [
            PopulationDensity(habitat_name="Savanna North", species="African Elephant", density=0.31, area_km2=500.0, population_count=156, latitude=-2.33, longitude=34.83),
            PopulationDensity(habitat_name="Coastal Mangrove", species="Bengal Tiger", density=0.14, area_km2=300.0, population_count=42, latitude=21.94, longitude=89.18),
            PopulationDensity(habitat_name="Savanna South", species="African Lion", density=0.22, area_km2=400.0, population_count=88, latitude=-3.12, longitude=35.10),
            PopulationDensity(habitat_name="Mixed Woodland", species="Leopard", density=0.19, area_km2=350.0, population_count=67, latitude=-24.00, longitude=31.50),
            PopulationDensity(habitat_name="River Delta", species="Hippopotamus", density=1.05, area_km2=200.0, population_count=210, latitude=-13.10, longitude=31.80),
            PopulationDensity(habitat_name="Grassland Zone", species="Giraffe", density=0.28, area_km2=450.0, population_count=124, latitude=-2.85, longitude=34.50),
            PopulationDensity(habitat_name="Grassland Zone", species="Zebra", density=0.75, area_km2=600.0, population_count=450, latitude=-2.85, longitude=34.50),
            PopulationDensity(habitat_name="Mountain Forest", species="Black Rhino", density=0.11, area_km2=250.0, population_count=28, latitude=-1.47, longitude=29.40),
            PopulationDensity(habitat_name="Wetland Alpha", species="African Buffalo", density=0.95, area_km2=400.0, population_count=380, latitude=-19.30, longitude=22.80),
            PopulationDensity(habitat_name="Mountain Forest", species="Mountain Gorilla", density=0.35, area_km2=150.0, population_count=53, latitude=-1.47, longitude=29.40)
        ]
        db.add_all(density_records)
        db.commit()

    # 3c. Seed Habitat Risks (if empty)
    if db.query(HabitatRisk).count() == 0:
        logger.info("Seeding Habitat Risks...")
        risk_records = [
            HabitatRisk(habitat_name="Grassland Zone", risk_category="Human Disturbance & Overgrazing", risk_score=49.0, primary_threat="Livestock Encroachment", affected_species="Zebra, Giraffe", description="Grassland Zone experiences high human disturbance and agricultural pressure."),
            HabitatRisk(habitat_name="Desert Edge", risk_category="Severe Water Depletion", risk_score=62.0, primary_threat="Extended Drought", affected_species="Cheetah, Desert Gazelle", description="Arid region with critical moisture deficits and high fire risk."),
            HabitatRisk(habitat_name="Coastal Mangrove", risk_category="Sea Level Rise & Pollution", risk_score=58.0, primary_threat="Salinity & Coastal Development", affected_species="Bengal Tiger, Estuarine Crocodile", description="Fragile coastal ecosystem threatened by human encroachment."),
            HabitatRisk(habitat_name="Rift Valley", risk_category="Eutrophication & Agricultural Runoff", risk_score=71.0, primary_threat="Industrial Pollution", affected_species="Flamingo, Waterfowl", description="Critical pollution levels requiring immediate remediation.")
        ]
        db.add_all(risk_records)
        db.commit()

    # 3d. Seed Migration Corridors (if empty)
    if db.query(MigrationCorridor).count() == 0:
        logger.info("Seeding Migration Corridors...")
        corridor_records = [
            MigrationCorridor(corridor_name="Serengeti-Mara Elephant Way", from_habitat="Savanna North", to_habitat="Savanna South", species="African Elephant", distance_km=145.0, risk_level="Medium", is_active=True),
            MigrationCorridor(corridor_name="Zebra Great Migration Route", from_habitat="Grassland Zone", to_habitat="Wetland Alpha", species="Zebra", distance_km=280.0, risk_level="Low", is_active=True),
            MigrationCorridor(corridor_name="Virunga Mountain Pass", from_habitat="Mountain Forest", to_habitat="Bamboo Forest", species="Mountain Gorilla", distance_km=62.0, risk_level="High", is_active=True),
            MigrationCorridor(corridor_name="Luangwa River Delta Corridor", from_habitat="River Delta", to_habitat="Mixed Woodland", species="Hippopotamus", distance_km=95.0, risk_level="Medium", is_active=True)
        ]
        db.add_all(corridor_records)
        db.commit()


    # 4. Seed Conservation Recommendations (12+ records)
    if db.query(ConservationRecommendation).count() == 0:
        logger.info("Seeding Conservation Recommendations...")
        recs = [
            ConservationRecommendation(
                species="African Elephant", habitat="Savanna North", category="Anti Poaching",
                title="Deploy Anti-Poaching Ranger Patrols & GPS Tracking",
                threat_level="Critical", main_threat="Poaching & Illegal Ivory Trade",
                recommended_action="Deploy 24/7 anti-poaching foot patrols equipped with satellite collars and night-vision optics.",
                recommendation="Deploy 24/7 anti-poaching foot patrols equipped with satellite collars and night-vision optics.",
                reason="Elephant population in Savanna North has experienced pressure along border migratory routes.",
                expected_impact="Reduces poaching incidents by an estimated 85% and secures 500 km2 corridor.",
                priority="Critical", estimated_cost=150000.0, completion_status="In Progress",
                assigned_team="Alpha Ranger Unit", deadline="2026-12-31"
            ),
            ConservationRecommendation(
                species="Bengal Tiger", habitat="Coastal Mangrove", category="Species Monitoring",
                title="Deploy AI Camera Traps & Conflict Compensation Scheme",
                threat_level="Critical", main_threat="Habitat Fragmentation & Poaching",
                recommended_action="Install 50 thermal AI camera traps and launch community livestock compensation fund.",
                recommendation="Install 50 thermal AI camera traps and launch community livestock compensation fund.",
                reason="Tiger population decreased by -8.7% over recent monitoring periods due to human-wildlife encounters.",
                expected_impact="Eliminates retaliatory killings and stabilizes tiger breeding pairs.",
                priority="Critical", estimated_cost=120000.0, completion_status="In Progress",
                assigned_team="Tiger Watch Taskforce", deadline="2026-11-30"
            ),
            ConservationRecommendation(
                species="Black Rhino", habitat="Mountain Forest", category="Anti Poaching",
                title="Increase High-Altitude Drone Surveillance & Horn Devaluing",
                threat_level="Critical", main_threat="Horn Poaching Syndicates",
                recommended_action="Conduct daily long-range thermal drone sweeps and horn DNA profiling.",
                recommendation="Conduct daily long-range thermal drone sweeps and horn DNA profiling.",
                reason="Only 28 Black Rhinos remain in the sanctuary, requiring zero-tolerance protection.",
                expected_impact="Protects 100% of breeding rhinos in Ngorongoro Crater sanctuary.",
                priority="Critical", estimated_cost=200000.0, completion_status="Planning",
                assigned_team="Rhino Defense Corps", deadline="2027-03-31"
            ),
            ConservationRecommendation(
                species="Leopard", habitat="Mixed Woodland", category="Habitat Restoration",
                title="Habitat Corridor Restoration & Wire Snare Removal",
                threat_level="Medium", main_threat="Illegal Wire Snares & Prey Depletion",
                recommended_action="Clear wire snares across 350 km2 and restore natural prey waterholes.",
                recommendation="Clear wire snares across 350 km2 and restore natural prey waterholes.",
                reason="Unselective snaring poses severe incidental mortality to solitary leopards.",
                expected_impact="Removes 95% of active snares and restores prey density.",
                priority="Medium", estimated_cost=45000.0, completion_status="Active",
                assigned_team="Habitat Restoration Crew", deadline="2026-10-15"
            ),
            ConservationRecommendation(
                species="African Lion", habitat="Savanna South", category="Community Awareness",
                title="Construct Predator-Proof Bomas & Lion Guardian Network",
                threat_level="High", main_threat="Retaliatory Cattle Poisoning",
                recommended_action="Build 120 solar-lighted predator bomas and hire local Maasai lion guardians.",
                recommendation="Build 120 solar-lighted predator bomas and hire local Maasai lion guardians.",
                reason="Cattle livestock depredation leads to retaliatory poisoning in Savanna South.",
                expected_impact="Reduces lion-livestock conflicts by 90% and fosters community stewardship.",
                priority="High", estimated_cost=85000.0, completion_status="In Progress",
                assigned_team="Community Coexistence Unit", deadline="2026-09-30"
            ),
            ConservationRecommendation(
                species="Hippopotamus", habitat="River Delta", category="Policy Recommendation",
                title="Enforce Riverine Buffer Policy & Seasonal Flow Safeguards",
                threat_level="Medium", main_threat="Agricultural Water Extraction",
                recommended_action="Establish 100m non-farming buffer zone along Luangwa riverbanks.",
                recommendation="Establish 100m non-farming buffer zone along Luangwa riverbanks.",
                reason="Water abstraction during dry seasons concentrates hippo pods into stressed pools.",
                expected_impact="Preserves perennial water flow for 210 hippos and associated aquatic species.",
                priority="Medium", estimated_cost=60000.0, completion_status="Completed",
                assigned_team="Hydrology & Flora Team", deadline="2026-06-30"
            ),
            ConservationRecommendation(
                species="Giraffe", habitat="Grassland Zone", category="Awareness Campaign",
                title="Community Wildlife Conservancy Expansion",
                threat_level="Low", main_threat="Fencing & Habitat Encroachment",
                recommended_action="Remove interior fence lines and launch eco-tourism dividend scheme.",
                recommendation="Remove interior fence lines and launch eco-tourism dividend scheme.",
                reason="Giraffes require wide open migratory ranges across Grassland Zone.",
                expected_impact="Unlocks 600 km2 contiguous grazing range.",
                priority="Low", estimated_cost=30000.0, completion_status="Active",
                assigned_team="Outreach Officers", deadline="2026-12-15"
            ),
            ConservationRecommendation(
                species="Snow Leopard", habitat="Alpine Meadow", category="Species Monitoring",
                title="High-Altitude Thermal Drone & Camera Network",
                threat_level="High", main_threat="Climate-Induced Range Shift",
                recommended_action="Deploy cold-rated AI camera stations at 4000m altitude passways.",
                recommendation="Deploy cold-rated AI camera stations at 4000m altitude passways.",
                reason="Rare snow leopard sightings require automated computer vision tracking.",
                expected_impact="Maps 100% of high-altitude travel corridors.",
                priority="High", estimated_cost=110000.0, completion_status="In Progress",
                assigned_team="Alpine Rangers", deadline="2027-01-31"
            ),
            ConservationRecommendation(
                species="Mountain Gorilla", habitat="Mountain Forest", category="Breeding Program",
                title="Strict Veterinary Health Screening & Forest Agroforestry",
                threat_level="High", main_threat="Respiratory Disease Transmission from Humans",
                recommended_action="Enforce 10m tourist viewing distance and regular health checks for 53 gorillas.",
                recommendation="Enforce 10m tourist viewing distance and regular health checks for 53 gorillas.",
                reason="Primate disease susceptibility presents critical health risks to mountain gorillas.",
                expected_impact="Prevents disease outbreaks and supports 3.1% annual population growth.",
                priority="High", estimated_cost=140000.0, completion_status="Active",
                assigned_team="Primate Health Network", deadline="2026-11-15"
            ),
            ConservationRecommendation(
                species="Polar Bear", habitat="Coastal Ice", category="Policy Recommendation",
                title="Designate Arctic Marine Protected Sanctuary",
                threat_level="Critical", main_threat="Receding Sea Ice & Shipping Noise",
                recommended_action="Restrict heavy vessel transit and declare 1000 km2 marine sanctuary.",
                recommendation="Restrict heavy vessel transit and declare 1000 km2 marine sanctuary.",
                reason="Polar bear hunting grounds are shrinking due to rapid sea ice loss.",
                expected_impact="Protects essential ice-edge seal hunting habitats.",
                priority="Critical", estimated_cost=250000.0, completion_status="Planning",
                assigned_team="Polar Conservation Taskforce", deadline="2027-06-30"
            ),
            ConservationRecommendation(
                species="African Wild Dog", habitat="River Delta", category="Species Monitoring",
                title="Mass Domestic Dog Rabies Vaccination Drive",
                threat_level="High", main_threat="Canine Distemper & Rabies",
                recommended_action="Vaccinate 5,000 domestic dogs in villages bordering Okavango Delta.",
                recommendation="Vaccinate 5,000 domestic dogs in villages bordering Okavango Delta.",
                reason="Rabies outbreaks from domestic dogs have wiped out entire wild dog packs.",
                expected_impact="Creates 100% disease barrier protecting endangered wild dog packs.",
                priority="High", estimated_cost=55000.0, completion_status="In Progress",
                assigned_team="Vet Mobile Unit", deadline="2026-10-31"
            ),
            ConservationRecommendation(
                species="Red Panda", habitat="Bamboo Forest", category="Habitat Restoration",
                title="Native Bamboo Reforestation Corridor",
                threat_level="Medium", main_threat="Bamboo Habitat Fragmentation",
                recommended_action="Plant 50,000 native bamboo saplings between isolated forest fragments.",
                recommendation="Plant 50,000 native bamboo saplings between isolated forest fragments.",
                reason="Red pandas depend exclusively on contiguous bamboo canopy.",
                expected_impact="Reconnects 120 km2 of vital bamboo feeding habitat.",
                priority="Medium", estimated_cost=40000.0, completion_status="Active",
                assigned_team="Forestry Team Beta", deadline="2026-12-01"
            ),
        ]
        db.add_all(recs)
        db.commit()

    # 5. Seed 12 Monthly Ecosystem Health Reports
    if db.query(EcosystemHealth).count() == 0:
        logger.info("Seeding 12 Monthly Ecosystem Health Reports...")
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        eco_reports = []
        for i, m_name in enumerate(months):
            m_num = i + 1
            # Realistic monthly variations
            bio_idx = round(82.0 + (3.0 if m_num in [1, 3, 10, 11, 12] else -2.0 if m_num in [6, 7] else 0.0), 1)
            veg_idx = round(85.0 + (5.0 if m_num in [3, 4, 11, 12] else -6.0 if m_num in [6, 7] else 1.0), 1)
            wat_qty = round(88.0 + (4.0 if m_num in [1, 2, 11, 12] else -7.0 if m_num in [6, 7] else 0.0), 1)
            pol_lvl = round(15.0 + (8.0 if m_num in [6, 7] else -3.0 if m_num in [11, 12] else 0.0), 1)
            overall = round((bio_idx * 0.35 + veg_idx * 0.25 + wat_qty * 0.25 + (100 - pol_lvl) * 0.15), 1)
            grd = "Excellent" if overall >= 85 else "Good" if overall >= 75 else "Moderate"
            
            eco_reports.append(
                EcosystemHealth(
                    month=m_name, recorded_date=date(2026, m_num, 15),
                    biodiversity_index=bio_idx, vegetation_index=veg_idx, water_quality=wat_qty,
                    soil_quality=round(82.0 + (m_num % 3), 1), pollution_level=pol_lvl,
                    species_richness=110 + (m_num * 2), climate_risk=round(15.0 + (m_num * 1.2), 1),
                    shannon_index=round(2.6 + (m_num * 0.02), 2), evenness_index=round(0.82 + (m_num * 0.005), 2),
                    habitat_quality_score=veg_idx, population_stability=round(80.0 + (m_num * 0.5), 1),
                    threat_level=pol_lvl, protected_species_count=54, invasive_species_count=2,
                    overall_health_score=overall, ecosystem_score=overall, grade=grd
                )
            )
        db.add_all(eco_reports)
        db.commit()

    logger.info("Milestone 3 SQLite database seeding completed successfully.")
