from pathlib import Path

ROOT = Path(__file__).resolve().parent


def split_dataset() -> dict[str, int]:
    image_count = sum(1 for path in (ROOT / "images").rglob("*") if path.is_file())
    audio_count = sum(1 for path in (ROOT / "audio").rglob("*") if path.is_file())
    return {"train": max(1, image_count // 2), "validation": max(1, image_count // 4), "test": max(1, image_count // 4), "audio_files": audio_count}


if __name__ == "__main__":
    print(split_dataset())
