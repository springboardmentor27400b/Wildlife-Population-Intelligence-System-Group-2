import subprocess
import zipfile
from pathlib import Path


BUCKET = "us-west-2.opendata.source.coop"

KEY = (
    "agentmorris/lila-wildlife/"
    "snapshotserengeti-v-2-0/"
    "SnapshotSerengeti_S04_v2_0.zip"
)

TARGET = "S4/N06/N06_R1/S4_N06_R1_IMAG1059.JPG"

# Information obtained from the ZIP central directory
LOCAL_HEADER_OFFSET = 291317823675
COMPRESSED_SIZE = 958681


OUTPUT_DIR = (
    Path(__file__).resolve().parents[2]
    / "datasets"
    / "species_identification"
    / "images"
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / Path(TARGET).name

TEMP_HEADER = Path("snapshot_local_header.bin")
TEMP_IMAGE = Path("snapshot_image_data.bin")


def aws_range(start, end, output):
    print(f"Downloading bytes {start:,}-{end:,}")

    command = [
        "aws",
        "s3api",
        "get-object",
        "--no-sign-request",
        "--bucket",
        BUCKET,
        "--key",
        KEY,
        "--range",
        f"bytes={start}-{end}",
        str(output),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
        raise RuntimeError("AWS range request failed")


print("=" * 50)
print("Downloading ONE Snapshot Serengeti image")
print("=" * 50)

print(f"Target: {TARGET}")
print(f"ZIP offset: {LOCAL_HEADER_OFFSET:,}")
print(f"Image size: {COMPRESSED_SIZE:,}")
print()


# -------------------------------------------------
# 1. Download local ZIP header
# -------------------------------------------------

aws_range(
    LOCAL_HEADER_OFFSET,
    LOCAL_HEADER_OFFSET + 4095,
    TEMP_HEADER,
)


# -------------------------------------------------
# 2. Read ZIP local header
# -------------------------------------------------

with open(TEMP_HEADER, "rb") as f:
    header = f.read()


if header[:4] != b"PK\x03\x04":
    raise RuntimeError(
        "Invalid ZIP local header. "
        "The downloaded data is not a ZIP entry."
    )


# ZIP local header is 30 bytes.
filename_length = int.from_bytes(
    header[26:28],
    byteorder="little",
)

extra_length = int.from_bytes(
    header[28:30],
    byteorder="little",
)


data_offset = (
    LOCAL_HEADER_OFFSET
    + 30
    + filename_length
    + extra_length
)


print(f"Filename length: {filename_length}")
print(f"Extra field length: {extra_length}")
print(f"Actual image offset: {data_offset:,}")
print()


# -------------------------------------------------
# 3. Download image bytes
# -------------------------------------------------

aws_range(
    data_offset,
    data_offset + COMPRESSED_SIZE - 1,
    TEMP_IMAGE,
)


# -------------------------------------------------
# 4. Save image
# -------------------------------------------------

image_data = TEMP_IMAGE.read_bytes()

if len(image_data) != COMPRESSED_SIZE:
    raise RuntimeError(
        f"Expected {COMPRESSED_SIZE} bytes "
        f"but received {len(image_data)} bytes."
    )


OUTPUT_FILE.write_bytes(image_data)


# -------------------------------------------------
# 5. Cleanup
# -------------------------------------------------

TEMP_HEADER.unlink(missing_ok=True)
TEMP_IMAGE.unlink(missing_ok=True)


print()
print("=" * 50)
print("IMAGE SUCCESSFULLY EXTRACTED")
print("=" * 50)
print(f"Saved to:")
print(OUTPUT_FILE)
print()
print(f"Size: {len(image_data):,} bytes")
print("=" * 50)