from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any
import csv


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MANIFEST_FILE = (
    BASE_DIR
    / "datasets"
    / "species_identification"
    / "training_manifest.csv"
)

if not MANIFEST_FILE.exists():
    MANIFEST_FILE = (
        BASE_DIR.parent
        / "datasets"
        / "species_identification"
        / "training_manifest.csv"
    )


# ============================================================
# LOAD DATA
# ============================================================

def _load_manifest() -> list[dict[str, str]]:
    if not MANIFEST_FILE.exists():
        return []

    records: list[dict[str, str]] = []

    with open(
        MANIFEST_FILE,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:
            records.append(
                {
                    key: (value or "").strip()
                    for key, value in row.items()
                }
            )

    return records


# ============================================================
# SPECIES POPULATION
# ============================================================

def get_species_population(
    species: str | None = None,
) -> list[dict[str, Any]]:

    records = _load_manifest()

    counter: Counter[str] = Counter()

    for record in records:

        name = record.get("Species", "").strip()

        if not name:
            continue

        if (
            species
            and name.lower() != species.lower()
        ):
            continue

        counter[name] += 1

    total = sum(counter.values())

    result: list[dict[str, Any]] = []

    for name, count in sorted(
        counter.items(),
        key=lambda item: item[1],
        reverse=True,
    ):

        percentage = (
            (count / total) * 100
            if total
            else 0
        )

        result.append(
            {
                "species": name,
                "count": count,
                "percentage": round(
                    percentage,
                    2,
                ),
            }
        )

    return result


# ============================================================
# EXECUTIVE POPULATION DASHBOARD
# ============================================================

def get_population_dashboard(
    species: str | None = None,
    protected_area_id: int | None = None,
) -> dict[str, Any]:

    records = _load_manifest()

    population = get_species_population(
        species=species,
    )

    total_records = len(records)

    species_count = len(population)

    total_population = sum(
        item["count"]
        for item in population
    )

    top_species = (
        population[0]["species"]
        if population
        else None
    )

    top_species_count = (
        population[0]["count"]
        if population
        else 0
    )

    return {
        "status": "success",

        "summary": {
            "total_records": total_records,
            "species_count": species_count,
            "total_population": total_population,
            "top_species": top_species,
            "top_species_count": top_species_count,
        },

        "filters": {
            "species": species,
            "protected_area_id": protected_area_id,
        },

        "species_population": population,
    }