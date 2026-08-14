import csv
from pathlib import Path
from typing import Dict, Any, Optional
from app.core.logging_config import logger

class TaxonomyResolver:
    def __init__(self):
        self.taxonomy_path = Path(__file__).resolve().parent.parent / "models" / "audio" / "taxonomy.csv"
        self.mappings: Dict[str, Dict[str, str]] = {}
        self._load_taxonomy()

    def _load_taxonomy(self):
        if not self.taxonomy_path.exists():
            logger.error(f"Taxonomy CSV not found at: {self.taxonomy_path}")
            return
            
        try:
            with open(self.taxonomy_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    label = row.get("primary_label")
                    if label:
                        self.mappings[label] = {
                            "primary_label": label,
                            "inat_taxon_id": row.get("inat_taxon_id", ""),
                            "scientific_name": row.get("scientific_name", "Unknown"),
                            "common_name": row.get("common_name", "Unknown"),
                            "class_name": row.get("class_name", "Unknown")
                        }
            logger.info(f"Loaded {len(self.mappings)} taxonomy mappings from {self.taxonomy_path}")
        except Exception as e:
            logger.error(f"Failed to read taxonomy file: {e}")

    def resolve(self, label: str) -> Dict[str, str]:
        """
        Returns taxonomy dictionary for label, or default values if not found.
        """
        # Strip or clean input
        clean_label = str(label).strip()
        if clean_label in self.mappings:
            return self.mappings[clean_label]
            
        return {
            "primary_label": clean_label,
            "inat_taxon_id": "",
            "scientific_name": clean_label,
            "common_name": clean_label,
            "class_name": "Unknown"
        }

taxonomy_resolver = TaxonomyResolver()
