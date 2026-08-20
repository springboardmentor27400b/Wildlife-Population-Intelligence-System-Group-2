"""Deterministic, class-balanced 70/15/15 dataset split creation."""
from __future__ import annotations

import shutil
from collections import defaultdict
from pathlib import Path

from scripts.dataset_config import DATASET_PATHS, SPLIT_DIRS, SUPPORTED_AUDIO_EXTENSIONS, SUPPORTED_IMAGE_EXTENSIONS, configure_logging

logger = configure_logging()


def _label(dataset: str, root: Path, path: Path) -> str:
    parent = path.relative_to(root).parent
    return parent.parts[0] if parent.parts else f"{dataset}_unclassified"


def _allocation(count: int) -> tuple[int, int, int]:
    train = round(count * .70); validation = round(count * .15)
    return train, validation, count - train - validation


def split_dataset(seed: int = 42) -> dict:
    """Copy data into split folders while keeping every source class proportionate."""
    import random
    groups: dict[str, list[tuple[str, Path]]] = defaultdict(list)
    extensions = SUPPORTED_IMAGE_EXTENSIONS | SUPPORTED_AUDIO_EXTENSIONS
    for dataset, root in DATASET_PATHS.items():
        if root.exists():
            for path in root.rglob("*"):
                if path.is_file() and path.suffix.lower() in extensions:
                    groups[_label(dataset, root, path)].append((dataset, path))
    for directory in SPLIT_DIRS.values(): directory.mkdir(parents=True, exist_ok=True)
    counts = {name: 0 for name in SPLIT_DIRS}; class_counts = {name: {} for name in SPLIT_DIRS}
    rng = random.Random(seed)
    for label, files in groups.items():
        rng.shuffle(files); train_n, val_n, _ = _allocation(len(files))
        batches = {"train": files[:train_n], "validation": files[train_n:train_n + val_n], "test": files[train_n + val_n:]}
        for split, batch in batches.items():
            for dataset, source in batch:
                destination = SPLIT_DIRS[split] / label / dataset / source.name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)
            counts[split] += len(batch); class_counts[split][label] = len(batch)
    report = {"seed": seed, "ratios": {"train": .70, "validation": .15, "test": .15}, "files": counts, "classes": class_counts}
    logger.info("Created class-balanced split: %s", counts)
    return report


if __name__ == "__main__": print(split_dataset())
