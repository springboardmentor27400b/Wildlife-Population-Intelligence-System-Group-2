import os
import struct
import subprocess


BUCKET = "us-west-2.opendata.source.coop"

KEY = (
    "agentmorris/lila-wildlife/"
    "snapshotserengeti-v-2-0/"
    "SnapshotSerengeti_S04_v2_0.zip"
)

ZIP_OFFSET = 291317823675
COMPRESSED_SIZE = 958681

OUTPUT = (
    "../datasets/species_identification/"
    "images/test_S4_N06_R2_IMAG1059.JPG"
)


def aws_range(start, end, output):
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
        output,
    ]

    subprocess.run(
        command,
        check=True,
    )


os.makedirs(
    os.path.dirname(OUTPUT),
    exist_ok=True
)

# First download the local ZIP header.
header_file = "test_local_header.bin"

print("Downloading local ZIP header...")

aws_range(
    ZIP_OFFSET,
    ZIP_OFFSET + 1023,
    header_file
)

with open(header_file, "rb") as f:
    header = f.read()

if header[:4] != b"PK\x03\x04":
    raise RuntimeError(
        f"Invalid ZIP local header: {header[:16]!r}"
    )

(
    version,
    flags,
    compression,
    mod_time,
    mod_date,
    crc32,
    compressed_size,
    uncompressed_size,
    filename_length,
    extra_length,
) = struct.unpack_from(
    "<5H3I2H",
    header,
    4
)

header_length = (
    30 +
    filename_length +
    extra_length
)

print()
print("========== LOCAL HEADER ==========")
print("Compression:", compression)
print("Compressed size:", compressed_size)
print("Uncompressed size:", uncompressed_size)
print("Filename length:", filename_length)
print("Extra length:", extra_length)
print("Header length:", header_length)
print("===================================")

image_start = ZIP_OFFSET + header_length
image_end = image_start + compressed_size - 1

print()
print("Downloading image...")
print("Image bytes:")
print(image_start)
print("-")
print(image_end)

aws_range(
    image_start,
    image_end,
    OUTPUT
)

os.remove(header_file)

print()
print("Image downloaded:")
print(OUTPUT)

print()
print("Size:", os.path.getsize(OUTPUT))