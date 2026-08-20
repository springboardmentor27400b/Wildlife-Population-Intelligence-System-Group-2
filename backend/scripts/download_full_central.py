import subprocess
import os

BUCKET = "us-west-2.opendata.source.coop"
KEY = "agentmorris/lila-wildlife/snapshotserengeti-v-2-0/SnapshotSerengeti_S04_v2_0.zip"

CENTRAL_OFFSET = 395_093_220_270
CENTRAL_SIZE = 49_650_768

OUTPUT = "s04_central_full.bin"

# Download in manageable chunks.
CHUNK_SIZE = 5_000_000


def download_range(start, end, output_file):
    print(f"Downloading bytes {start:,} - {end:,}")

    cmd = [
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
        output_file,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(result.stderr)
        raise RuntimeError("AWS range request failed")


def main():
    print("=" * 60)
    print("DOWNLOAD SNAPSHOT SERENGETI ZIP64 CENTRAL DIRECTORY")
    print("=" * 60)

    print(f"Central offset : {CENTRAL_OFFSET:,}")
    print(f"Central size   : {CENTRAL_SIZE:,}")
    print(f"Output         : {OUTPUT}")
    print()

    temp_files = []

    for start in range(
        CENTRAL_OFFSET,
        CENTRAL_OFFSET + CENTRAL_SIZE,
        CHUNK_SIZE,
    ):
        end = min(
            start + CHUNK_SIZE - 1,
            CENTRAL_OFFSET + CENTRAL_SIZE - 1,
        )

        part_number = len(temp_files) + 1
        part_file = f"s04_central_part_{part_number:02d}.bin"

        download_range(start, end, part_file)

        expected = end - start + 1
        actual = os.path.getsize(part_file)

        print(f"  Received: {actual:,} bytes")

        if actual != expected:
            raise RuntimeError(
                f"Wrong size: expected {expected}, got {actual}"
            )

        temp_files.append(part_file)

    print()
    print("Combining parts...")

    with open(OUTPUT, "wb") as out:
        for part in temp_files:
            with open(part, "rb") as f:
                while True:
                    data = f.read(1024 * 1024)
                    if not data:
                        break
                    out.write(data)

    final_size = os.path.getsize(OUTPUT)

    print()
    print("=" * 60)
    print("DONE")
    print("=" * 60)
    print(f"Expected: {CENTRAL_SIZE:,}")
    print(f"Actual:   {final_size:,}")

    if final_size != CENTRAL_SIZE:
        raise RuntimeError("Final central directory has wrong size")

    print("Central directory downloaded successfully.")


if __name__ == "__main__":
    main()