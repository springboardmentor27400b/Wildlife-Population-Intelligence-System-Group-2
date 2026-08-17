# app/services/report_service.py

import os
import math
from collections import defaultdict

from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from openpyxl import Workbook

from app.models import Observation, MonitoringSite


# ============================================================
# REPORT DIRECTORY
# ============================================================

REPORT_DIR = "uploads/reports"

os.makedirs(REPORT_DIR, exist_ok=True)


# ============================================================
# MAIN PDF REPORT FUNCTION
# ============================================================

def generate_report(data: dict, db: Session):

    report_type = data.get("report_type", "population").lower()

    if report_type == "wildlife":
        return generate_wildlife_report(db)

    elif report_type == "population":
        return generate_population_report(db)

    elif report_type == "biodiversity":
        return generate_biodiversity_report(db)

    elif report_type == "habitat":
        return generate_habitat_report(db)

    elif report_type == "conservation":
        return generate_conservation_report(db)

    return {
        "success": False,
        "message": f"Invalid report type: {report_type}"
    }


# ============================================================
# PDF CREATOR
# ============================================================

def create_pdf(filename, title, sections):

    file_path = os.path.join(
        REPORT_DIR,
        filename
    )

    styles = getSampleStyleSheet()

    document = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    story = []

    story.append(
        Paragraph(
            title,
            styles["Title"]
        )
    )

    story.append(Spacer(1, 20))

    for section in sections:

        story.append(
            Paragraph(
                section["heading"],
                styles["Heading2"]
            )
        )

        story.append(Spacer(1, 8))

        if "text" in section:

            story.append(
                Paragraph(
                    str(section["text"]),
                    styles["BodyText"]
                )
            )

        if "table" in section:

            table = Table(
                section["table"],
                repeatRows=1
            )

            table.setStyle(
                TableStyle([
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#166534")
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey
                    ),
                    (
                        "PADDING",
                        (0, 0),
                        (-1, -1),
                        6
                    ),
                ])
            )

            story.append(table)

        story.append(Spacer(1, 15))

    document.build(story)

    return {
        "success": True,
        "message": "PDF report generated successfully",
        "file": file_path,
        "download_url": f"/report/download/{filename}"
    }


# ============================================================
# 1. WILDLIFE SURVEY REPORT
# ============================================================

def generate_wildlife_report(db: Session):

    observations = (
        db.query(Observation)
        .order_by(Observation.observation_date.desc())
        .all()
    )

    table = [
        [
            "Species",
            "Count",
            "Date",
            "Location",
            "Observer"
        ]
    ]

    total_animals = 0

    for observation in observations:

        count = observation.count or 0

        total_animals += count

        table.append([
            observation.species_name or "Unknown",
            count,
            str(observation.observation_date or "N/A"),
            observation.location or "Unknown",
            observation.observer_name or "Unknown"
        ])

    sections = [
        {
            "heading": "Survey Summary",
            "text": (
                f"Total observation records: {len(observations)}<br/>"
                f"Total animals recorded: {total_animals}"
            )
        },
        {
            "heading": "Wildlife Observations",
            "table": table
        }
    ]

    return create_pdf(
        "wildlife_survey_report.pdf",
        "Wildlife Survey Report",
        sections
    )


# ============================================================
# 2. POPULATION REPORT
# ============================================================

def generate_population_report(db: Session):

    observations = db.query(Observation).all()

    species_population = defaultdict(int)
    location_population = defaultdict(int)

    total_population = 0

    for observation in observations:

        species = observation.species_name or "Unknown"
        location = observation.location or "Unknown"
        count = observation.count or 0

        species_population[species] += count
        location_population[location] += count

        total_population += count

    species_count = len(species_population)

    dominant_species = (
        max(
            species_population,
            key=species_population.get
        )
        if species_population
        else "No data"
    )

    table = [
        [
            "Species",
            "Population"
        ]
    ]

    for species, population in sorted(
        species_population.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        table.append([
            species,
            population
        ])

    location_table = [
        [
            "Location",
            "Population"
        ]
    ]

    for location, population in sorted(
        location_population.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        location_table.append([
            location,
            population
        ])

    sections = [
        {
            "heading": "Population Metrics",
            "text": (
                f"Total Population: {total_population}<br/>"
                f"Species Richness: {species_count}<br/>"
                f"Dominant Species: {dominant_species}<br/>"
                f"Locations Recorded: {len(location_population)}"
            )
        },
        {
            "heading": "Population by Species",
            "table": table
        },
        {
            "heading": "Population by Location",
            "table": location_table
        }
    ]

    return create_pdf(
        "population_report.pdf",
        "Wildlife Population Report",
        sections
    )


# ============================================================
# 3. BIODIVERSITY REPORT
# ============================================================

def generate_biodiversity_report(db: Session):

    observations = db.query(Observation).all()

    species_population = defaultdict(int)

    total_population = 0

    for observation in observations:

        species = observation.species_name or "Unknown"
        count = observation.count or 0

        species_population[species] += count
        total_population += count

    species_count = len(species_population)

    # Shannon diversity index
    biodiversity_index = 0

    if total_population > 0:

        for population in species_population.values():

            if population > 0:

                proportion = population / total_population

                biodiversity_index -= (
                    proportion * math.log(proportion)
                )

    table = [
        [
            "Species",
            "Population",
            "Percentage"
        ]
    ]

    for species, population in sorted(
        species_population.items(),
        key=lambda x: x[1],
        reverse=True
    ):

        percentage = (
            (population / total_population) * 100
            if total_population > 0
            else 0
        )

        table.append([
            species,
            population,
            f"{percentage:.2f}%"
        ])

    sections = [
        {
            "heading": "Biodiversity Summary",
            "text": (
                f"Total Species: {species_count}<br/>"
                f"Total Animals: {total_population}<br/>"
                f"Shannon Biodiversity Index: "
                f"{biodiversity_index:.3f}"
            )
        },
        {
            "heading": "Species Diversity",
            "table": table
        }
    ]

    return create_pdf(
        "biodiversity_report.pdf",
        "Biodiversity Report",
        sections
    )


# ============================================================
# 4. HABITAT REPORT
# ============================================================

def generate_habitat_report(db: Session):

    sites = db.query(MonitoringSite).all()
    observations = db.query(Observation).all()

    habitat_data = defaultdict(
        lambda: {
            "sites": 0,
            "area": 0,
            "observations": 0,
            "population": 0,
            "species": set()
        }
    )

    location_to_habitat = {}

    for site in sites:

        habitat = site.habitat_type or "Unknown"

        habitat_data[habitat]["sites"] += 1

        habitat_data[habitat]["area"] += (
            site.area_km2 or 0
        )

        if site.location:
            location_to_habitat[
                site.location
            ] = habitat

    for observation in observations:

        location = observation.location or "Unknown"

        habitat = location_to_habitat.get(
            location,
            "Unknown"
        )

        habitat_data[habitat]["observations"] += 1

        habitat_data[habitat]["population"] += (
            observation.count or 0
        )

        if observation.species_name:
            habitat_data[habitat]["species"].add(
                observation.species_name
            )

    table = [
        [
            "Habitat",
            "Sites",
            "Area km²",
            "Observations",
            "Species",
            "Population"
        ]
    ]

    for habitat, values in habitat_data.items():

        table.append([
            habitat,
            values["sites"],
            values["area"],
            values["observations"],
            len(values["species"]),
            values["population"]
        ])

    sections = [
        {
            "heading": "Habitat Assessment",
            "text": (
                f"Monitoring sites: {len(sites)}<br/>"
                f"Habitat types: {len(habitat_data)}"
            )
        },
        {
            "heading": "Habitat Intelligence",
            "table": table
        }
    ]

    return create_pdf(
        "habitat_assessment_report.pdf",
        "Habitat Assessment Report",
        sections
    )


# ============================================================
# 5. CONSERVATION REPORT
# ============================================================

def generate_conservation_report(db: Session):

    observations = db.query(Observation).all()

    species_data = defaultdict(
        lambda: {
            "population": 0,
            "observations": 0,
            "locations": set()
        }
    )

    for observation in observations:

        species = observation.species_name or "Unknown"

        species_data[species]["population"] += (
            observation.count or 0
        )

        species_data[species]["observations"] += 1

        if observation.location:
            species_data[species]["locations"].add(
                observation.location
            )

    table = [
        [
            "Species",
            "Population",
            "Observations",
            "Locations",
            "Priority"
        ]
    ]

    for species, values in sorted(
        species_data.items(),
        key=lambda x: x[1]["population"]
    ):

        population = values["population"]

        # Derived conservation priority
        if population <= 5:
            priority = "High"
        elif population <= 20:
            priority = "Medium"
        else:
            priority = "Low"

        table.append([
            species,
            population,
            values["observations"],
            len(values["locations"]),
            priority
        ])

    sections = [
        {
            "heading": "Conservation Summary",
            "text": (
                "Priority is derived from observed population "
                "size. Lower observed populations receive higher "
                "conservation priority."
            )
        },
        {
            "heading": "Species Conservation Assessment",
            "table": table
        }
    ]

    return create_pdf(
        "conservation_report.pdf",
        "Conservation Report",
        sections
    )


# ============================================================
# EXCEL REPORT
# ============================================================

def generate_excel_report(data: dict, db: Session):

    report_type = data.get(
        "report_type",
        "population"
    ).lower()

    os.makedirs(
        REPORT_DIR,
        exist_ok=True
    )

    workbook = Workbook()

    # Remove default sheet
    default_sheet = workbook.active
    workbook.remove(default_sheet)

    # ========================================================
    # WILDLIFE
    # ========================================================

    if report_type == "wildlife":

        sheet = workbook.create_sheet(
            "Wildlife Observations"
        )

        sheet.append([
            "ID",
            "Species",
            "Count",
            "Date",
            "Location",
            "Observer",
            "Image",
            "Audio"
        ])

        observations = db.query(
            Observation
        ).all()

        for observation in observations:

            sheet.append([
                observation.id,
                observation.species_name,
                observation.count,
                str(observation.observation_date or ""),
                observation.location,
                observation.observer_name,
                "Yes" if observation.image_path else "No",
                "Yes" if observation.audio_path else "No"
            ])

        filename = "wildlife_survey_report.xlsx"

    # ========================================================
    # POPULATION
    # ========================================================

    elif report_type == "population":

        sheet = workbook.create_sheet(
            "Population"
        )

        sheet.append([
            "Species",
            "Population"
        ])

        observations = db.query(
            Observation
        ).all()

        species_population = defaultdict(int)

        for observation in observations:

            species_population[
                observation.species_name or "Unknown"
            ] += observation.count or 0

        for species, population in sorted(
            species_population.items(),
            key=lambda x: x[1],
            reverse=True
        ):

            sheet.append([
                species,
                population
            ])

        filename = "population_report.xlsx"

    # ========================================================
    # BIODIVERSITY
    # ========================================================

    elif report_type == "biodiversity":

        sheet = workbook.create_sheet(
            "Biodiversity"
        )

        sheet.append([
            "Species",
            "Population",
            "Percentage"
        ])

        observations = db.query(
            Observation
        ).all()

        species_population = defaultdict(int)

        total = 0

        for observation in observations:

            count = observation.count or 0

            species_population[
                observation.species_name or "Unknown"
            ] += count

            total += count

        for species, population in sorted(
            species_population.items(),
            key=lambda x: x[1],
            reverse=True
        ):

            percentage = (
                population / total * 100
                if total > 0
                else 0
            )

            sheet.append([
                species,
                population,
                round(percentage, 2)
            ])

        filename = "biodiversity_report.xlsx"

    # ========================================================
    # HABITAT
    # ========================================================

    elif report_type == "habitat":

        sheet = workbook.create_sheet(
            "Habitat"
        )

        sheet.append([
            "Habitat",
            "Monitoring Sites",
            "Area km²",
            "Observations",
            "Species Count",
            "Population"
        ])

        sites = db.query(
            MonitoringSite
        ).all()

        observations = db.query(
            Observation
        ).all()

        location_to_habitat = {}
        habitat_data = defaultdict(
            lambda: {
                "sites": 0,
                "area": 0,
                "observations": 0,
                "population": 0,
                "species": set()
            }
        )

        for site in sites:

            habitat = site.habitat_type or "Unknown"

            habitat_data[habitat]["sites"] += 1
            habitat_data[habitat]["area"] += (
                site.area_km2 or 0
            )

            if site.location:
                location_to_habitat[
                    site.location
                ] = habitat

        for observation in observations:

            habitat = location_to_habitat.get(
                observation.location or "Unknown",
                "Unknown"
            )

            habitat_data[habitat]["observations"] += 1
            habitat_data[habitat]["population"] += (
                observation.count or 0
            )

            if observation.species_name:
                habitat_data[habitat]["species"].add(
                    observation.species_name
                )

        for habitat, values in habitat_data.items():

            sheet.append([
                habitat,
                values["sites"],
                values["area"],
                values["observations"],
                len(values["species"]),
                values["population"]
            ])

        filename = "habitat_assessment_report.xlsx"

    # ========================================================
    # CONSERVATION
    # ========================================================

    elif report_type == "conservation":

        sheet = workbook.create_sheet(
            "Conservation"
        )

        sheet.append([
            "Species",
            "Population",
            "Observations",
            "Locations",
            "Priority"
        ])

        observations = db.query(
            Observation
        ).all()

        species_data = defaultdict(
            lambda: {
                "population": 0,
                "observations": 0,
                "locations": set()
            }
        )

        for observation in observations:

            species = (
                observation.species_name
                or "Unknown"
            )

            species_data[species]["population"] += (
                observation.count or 0
            )

            species_data[species]["observations"] += 1

            if observation.location:
                species_data[species]["locations"].add(
                    observation.location
                )

        for species, values in sorted(
            species_data.items(),
            key=lambda x: x[1]["population"]
        ):

            population = values["population"]

            if population <= 5:
                priority = "High"
            elif population <= 20:
                priority = "Medium"
            else:
                priority = "Low"

            sheet.append([
                species,
                population,
                values["observations"],
                len(values["locations"]),
                priority
            ])

        filename = "conservation_report.xlsx"

    else:

        return {
            "success": False,
            "message": f"Invalid report type: {report_type}"
        }

    # ========================================================
    # COLUMN WIDTHS
    # ========================================================

    for sheet in workbook.worksheets:

        for column in sheet.columns:

            max_length = 0

            for cell in column:

                if cell.value is not None:

                    max_length = max(
                        max_length,
                        len(str(cell.value))
                    )

            sheet.column_dimensions[
                column[0].column_letter
            ].width = min(
                max_length + 2,
                60
            )

    # ========================================================
    # SAVE
    # ========================================================

    file_path = os.path.join(
        REPORT_DIR,
        filename
    )

    workbook.save(file_path)

    return {
        "success": True,
        "message": "Excel report generated successfully",
        "file": file_path,
        "download_url": f"/report/download-excel/{filename}"
    }