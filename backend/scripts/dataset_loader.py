"""Reusable, path-oriented loaders for source data and generated splits."""
from __future__ import annotations

from pathlib import Path

from scripts.dataset_config import DATASET_PATHS, SPLIT_DIRS, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS


def _dataset_roots(dataset_name: str | None) -> list[Path]:
    if dataset_name and dataset_name not in DATASET_PATHS:
        raise ValueError(f"Unknown dataset: {dataset_name}")
    return [DATASET_PATHS[dataset_name]] if dataset_name else list(DATASET_PATHS.values())


def _media(extensions: set[str], dataset_name: str | None = None) -> list[Path]:
    return sorted(path for root in _dataset_roots(dataset_name) if root.exists() for path in root.rglob("*") if path.is_file() and path.suffix.lower() in extensions)


def load_images(dataset_name: str | None = None) -> list[Path]: return _media(SUPPORTED_IMAGE_EXTENSIONS, dataset_name)
def load_audio(dataset_name: str | None = None) -> list[Path]: return _media(SUPPORTED_AUDIO_EXTENSIONS, dataset_name)
def load_metadata(dataset_name: str | None = None) -> list[Path]: return _media({".csv", ".json", ".xml", ".parquet"}, dataset_name)


def load_species(dataset_name: str | None = None) -> list[str]:
    species = set()
    for root in _dataset_roots(dataset_name):
        for path in load_images(dataset_name) + load_audio(dataset_name):
            if path.is_relative_to(root):
                relative_parent = path.relative_to(root).parent
                species.add(relative_parent.parts[0] if relative_parent.parts else path.stem.split("_")[0])
    return sorted(species)


def _split(name: str) -> list[Path]:
    root = SPLIT_DIRS[name]
    return sorted(path for path in root.rglob("*") if path.is_file()) if root.exists() else []


def load_train() -> list[Path]: return _split("train")
def load_validation() -> list[Path]: return _split("validation")
def load_test() -> list[Path]: return _split("test")
