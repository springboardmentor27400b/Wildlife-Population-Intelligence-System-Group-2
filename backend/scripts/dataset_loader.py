"""Reusable, path-oriented loaders for source data and generated splits."""
from __future__ import annotations

from pathlib import Path

from scripts.dataset_config import DATASET_PATHS, SPLIT_DIRS, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS


from scripts.dataset_config import DATASET_ROOT, DATASET_PATHS, SPLIT_DIRS, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS


def _dataset_roots(dataset_name: str | None) -> list[Path]:
    if dataset_name and dataset_name not in DATASET_PATHS:
        return [DATASET_ROOT / dataset_name] if (DATASET_ROOT / dataset_name).exists() else [DATASET_ROOT]
    return [DATASET_PATHS[dataset_name]] if dataset_name else [DATASET_ROOT]


def _media(extensions: set[str], dataset_name: str | None = None) -> list[Path]:
    results = set()
    for root in _dataset_roots(dataset_name):
        if root.exists():
            for path in root.rglob("*"):
                if path.is_file() and path.suffix.lower() in extensions:
                    # Ignore gitkeep and processed outputs unless asked
                    if path.name != ".gitkeep":
                        results.add(path)
    return sorted(results)


def load_images(dataset_name: str | None = None) -> list[Path]: return _media(SUPPORTED_IMAGE_EXTENSIONS, dataset_name)
def load_audio(dataset_name: str | None = None) -> list[Path]: return _media(SUPPORTED_AUDIO_EXTENSIONS, dataset_name)
def load_metadata(dataset_name: str | None = None) -> list[Path]: return _media({".csv", ".json", ".xml", ".parquet"}, dataset_name)


def load_species(dataset_name: str | None = None) -> list[str]:
    species = set()
    for path in load_images(dataset_name) + load_audio(dataset_name):
        parent_name = path.parent.name.lower()
        if parent_name not in {"images", "audio", "species_images", "processed", "train", "test", "validation", "datasets", "dataset"}:
            species.add(path.parent.name.replace("_", " ").title())
        else:
            # Extract species from filename prefix (e.g. african_elephant.jpg -> African Elephant)
            name_part = path.stem.split("_sample")[0].split("_test")[0].split("_audio")[0]
            name_part = " ".join(name_part.split("_")).title()
            if name_part and not name_part.isdigit():
                species.add(name_part)
    return sorted(species)



def _split(name: str) -> list[Path]:
    root = SPLIT_DIRS[name]
    return sorted(path for path in root.rglob("*") if path.is_file()) if root.exists() else []


def load_train() -> list[Path]: return _split("train")
def load_validation() -> list[Path]: return _split("validation")
def load_test() -> list[Path]: return _split("test")
