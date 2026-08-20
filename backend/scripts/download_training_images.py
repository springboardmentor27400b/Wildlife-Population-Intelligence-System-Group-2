import csv
import os
import struct
import subprocess
import tempfile
import time
from pathlib import Path
import shutil
from PIL import Image


# ============================================================
# CONFIGURATION
# ============================================================

BUCKET = "us-west-2.opendata.source.coop"

KEY = (
    "agentmorris/lila-wildlife/"
    "snapshotserengeti-v-2-0/"
    "SnapshotSerengeti_S04_v2_0.zip"
)

CENTRAL_FILE = Path("s04_central_full.bin")

MANIFEST_FILE = Path(
    "../datasets/species_identification/training_manifest.csv"
)

OUTPUT_DIR = Path(
    "../datasets/species_identification/images"
)

PROGRESS_EVERY = 10

AWS_RETRIES = 5

RETRY_DELAY = 3


# ============================================================
# AWS RANGE DOWNLOAD
# ============================================================

def aws_range(start, end, output_file):
    """
    Download a byte range from the public S3 ZIP.

    Includes retry handling for unstable network connections.
    """

    for attempt in range(1, AWS_RETRIES + 1):

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
            str(output_file),
        ]

        try:

            result = subprocess.run(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            if result.returncode == 0:

                if not output_file.exists():
                    raise RuntimeError(
                        "AWS completed but output file was not created"
                    )

                return

            print(
                f"      AWS attempt "
                f"{attempt}/{AWS_RETRIES} failed"
            )

            print(
                f"      {result.stderr.strip()}"
            )

        except Exception as exc:

            print(
                f"      Network error "
                f"{attempt}/{AWS_RETRIES}: {exc}"
            )

        if attempt < AWS_RETRIES:

            time.sleep(
                RETRY_DELAY * attempt
            )

    raise RuntimeError(
        f"Failed downloading range "
        f"{start}-{end} after "
        f"{AWS_RETRIES} attempts"
    )


# ============================================================
# LOAD TRAINING MANIFEST
# ============================================================

def load_manifest():

    print("Loading training manifest...")

    if not MANIFEST_FILE.exists():

        raise FileNotFoundError(
            f"Manifest not found: {MANIFEST_FILE}"
        )

    images = {}

    with open(
        MANIFEST_FILE,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as f:

        reader = csv.DictReader(f)

        required = {
            "URL_Info",
            "Species",
        }

        missing = (
            required -
            set(reader.fieldnames or [])
        )

        if missing:

            raise RuntimeError(
                f"Manifest missing columns: {missing}"
            )

        for row in reader:

            url = row["URL_Info"].strip()

            species = row["Species"].strip()

            if url:

                images[url] = species

    return images


# ============================================================
# ZIP64 EXTRA FIELD PARSER
# ============================================================

def parse_zip64_extra(
    extra,
    compressed_size,
    uncompressed_size,
    local_offset,
):
    """
    Parse ZIP64 extra field (0x0001).

    ZIP64 values appear only when the corresponding
    normal ZIP field is 0xFFFFFFFF.
    """

    position = 0

    while position + 4 <= len(extra):

        field_id, field_size = struct.unpack(
            "<HH",
            extra[position:position + 4],
        )

        field_start = position + 4

        field_end = (
            field_start +
            field_size
        )

        if field_end > len(extra):
            break

        field_data = extra[
            field_start:field_end
        ]

        if field_id == 0x0001:

            q = 0

            if uncompressed_size == 0xFFFFFFFF:

                if q + 8 > len(field_data):
                    raise RuntimeError(
                        "Invalid ZIP64 uncompressed size"
                    )

                uncompressed_size = struct.unpack(
                    "<Q",
                    field_data[q:q + 8],
                )[0]

                q += 8

            if compressed_size == 0xFFFFFFFF:

                if q + 8 > len(field_data):
                    raise RuntimeError(
                        "Invalid ZIP64 compressed size"
                    )

                compressed_size = struct.unpack(
                    "<Q",
                    field_data[q:q + 8],
                )[0]

                q += 8

            if local_offset == 0xFFFFFFFF:

                if q + 8 > len(field_data):
                    raise RuntimeError(
                        "Invalid ZIP64 local offset"
                    )

                local_offset = struct.unpack(
                    "<Q",
                    field_data[q:q + 8],
                )[0]

                q += 8

            return (
                compressed_size,
                uncompressed_size,
                local_offset,
            )

        position = field_end

    return (
        compressed_size,
        uncompressed_size,
        local_offset,
    )


# ============================================================
# PARSE CENTRAL DIRECTORY
# ============================================================

def parse_central_directory():

    print()
    print("Reading ZIP64 central directory...")
    print(
        f"Central directory: {CENTRAL_FILE}"
    )

    if not CENTRAL_FILE.exists():

        raise FileNotFoundError(
            f"Missing {CENTRAL_FILE}"
        )

    data = CENTRAL_FILE.read_bytes()

    print(
        f"Central directory size: "
        f"{len(data):,}"
    )

    entries = {}

    signature = b"PK\x01\x02"

    position = 0

    examined = 0

    length = len(data)

    while position + 46 <= length:

        idx = data.find(
            signature,
            position,
        )

        if idx == -1:
            break

        position = idx

        header = data[
            position:
            position + 46
        ]

        try:

            (
                sig,
                version_made,
                version_needed,
                flags,
                compression,
                mod_time,
                mod_date,
                crc32,
                compressed_size,
                uncompressed_size,
                filename_length,
                extra_length,
                comment_length,
                disk_number,
                internal_attributes,
                external_attributes,
                local_offset,
            ) = struct.unpack(
                "<4s6H3I5H2I",
                header,
            )

        except struct.error:

            break

        filename_start = (
            position + 46
        )

        filename_end = (
            filename_start +
            filename_length
        )

        extra_start = filename_end

        extra_end = (
            extra_start +
            extra_length
        )

        comment_end = (
            extra_end +
            comment_length
        )

        if comment_end > length:
            break

        filename_bytes = data[
            filename_start:
            filename_end
        ]

        try:

            filename = (
                filename_bytes
                .decode("utf-8")
            )

        except UnicodeDecodeError:

            filename = (
                filename_bytes
                .decode(
                    "cp437",
                    errors="replace",
                )
            )

        extra = data[
            extra_start:
            extra_end
        ]

        (
            compressed_size,
            uncompressed_size,
            local_offset,
        ) = parse_zip64_extra(
            extra,
            compressed_size,
            uncompressed_size,
            local_offset,
        )

        entries[filename] = {
            "local_offset": local_offset,
            "compressed_size": compressed_size,
            "uncompressed_size": uncompressed_size,
            "compression": compression,
            "crc32": crc32,
            "flags": flags,
        }

        examined += 1

        position = comment_end

    print(
        f"Central directory entries parsed: "
        f"{examined:,}"
    )

    return entries


# ============================================================
# DOWNLOAD ONE ZIP ENTRY
# ============================================================

def extract_one(
    url,
    info,
    destination,
):

    local_offset = info[
        "local_offset"
    ]

    compressed_size = info[
        "compressed_size"
    ]

    compression = info[
        "compression"
    ]

    expected_crc = info[
        "crc32"
    ]

    if compression != 0:

        raise RuntimeError(
            f"Unsupported compression method "
            f"{compression}"
        )

    if local_offset <= 0:

        raise RuntimeError(
            f"Invalid local offset: "
            f"{local_offset}"
        )

    # --------------------------------------------------------
    # Download local ZIP header
    # --------------------------------------------------------

    with tempfile.NamedTemporaryFile(
        suffix=".bin",
        delete=False,
    ) as tmp:

        header_file = Path(
            tmp.name
        )

    try:

        aws_range(
            local_offset,
            local_offset + 29,
            header_file,
        )

        header = header_file.read_bytes()

        if len(header) != 30:

            raise RuntimeError(
                f"Invalid local header size: "
                f"{len(header)}"
            )

        if header[:4] != b"PK\x03\x04":

            raise RuntimeError(
                "Invalid ZIP local header"
            )

        (
            signature,
            version,
            flags,
            compression_method,
            mod_time,
            mod_date,
            crc32_local,
            compressed_size_local,
            uncompressed_size_local,
            filename_length,
            extra_length,
        ) = struct.unpack(
            "<4s5H3I2H",
            header,
        )

        if compression_method != 0:

            raise RuntimeError(
                f"Local header compression "
                f"is {compression_method}"
            )

        # ----------------------------------------------------
        # Calculate actual image position
        # ----------------------------------------------------

        data_start = (
            local_offset
            + 30
            + filename_length
            + extra_length
        )

        data_end = (
            data_start
            + compressed_size
            - 1
        )

        print(
            f"      ZIP offset: "
            f"{local_offset:,}"
        )

        print(
            f"      Image offset: "
            f"{data_start:,}"
        )

        print(
            f"      Image size: "
            f"{compressed_size:,}"
        )

        # ----------------------------------------------------
        # Download image bytes
        # ----------------------------------------------------

        with tempfile.NamedTemporaryFile(
            suffix=".jpg",
            delete=False,
        ) as tmp:

            image_tmp = Path(
                tmp.name
            )

        try:

            aws_range(
                data_start,
                data_end,
                image_tmp,
            )

            downloaded_size = (
                image_tmp.stat().st_size
            )

            if (
                downloaded_size
                != compressed_size
            ):

                raise RuntimeError(
                    "Size mismatch: "
                    f"{downloaded_size} != "
                    f"{compressed_size}"
                )

            # ------------------------------------------------
            # Verify JPEG
            # ------------------------------------------------

            try:

                with Image.open(
                    image_tmp
                ) as im:

                    if im.format != "JPEG":

                        raise RuntimeError(
                            f"Downloaded file is "
                            f"{im.format}, not JPEG"
                        )

                    im.verify()

            except Exception as exc:

                raise RuntimeError(
                    f"JPEG validation failed: "
                    f"{exc}"
                )

            # ------------------------------------------------
            # Verify CRC32
            # ------------------------------------------------

            import zlib

            crc = 0

            with open(
                image_tmp,
                "rb",
            ) as f:

                while True:

                    chunk = f.read(
                        1024 * 1024
                    )

                    if not chunk:
                        break

                    crc = zlib.crc32(
                        chunk,
                        crc,
                    )

            crc &= 0xFFFFFFFF

            if crc != expected_crc:

                raise RuntimeError(
                    f"CRC mismatch: "
                    f"{crc:#010x} != "
                    f"{expected_crc:#010x}"
                )

            # ------------------------------------------------
            # Save
            # ------------------------------------------------

            destination.parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            shutil.copy2(image_tmp, destination)
            image_tmp.unlink()


        finally:

            if image_tmp.exists():

                image_tmp.unlink()

    finally:

        if header_file.exists():

            header_file.unlink()


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 60)
    print(
        "SNAPSHOT SERENGETI "
        "TRAINING IMAGE DOWNLOADER"
    )
    print("=" * 60)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Manifest
    # --------------------------------------------------------

    manifest = load_manifest()

    print(
        f"Training records: "
        f"{len(manifest):,}"
    )

    # --------------------------------------------------------
    # Central directory
    # --------------------------------------------------------

    entries = parse_central_directory()

    # --------------------------------------------------------
    # Determine targets
    # --------------------------------------------------------

    targets = []

    missing = []

    for url, species in manifest.items():

        filename = Path(url).name

        destination = (
            OUTPUT_DIR / filename
        )

        # Do NOT blindly trust existing files.
        # Validate them first.

        if destination.exists():

            try:

                with Image.open(
                    destination
                ) as im:

                    im.verify()

                continue

            except Exception:

                print(
                    f"Invalid existing file: "
                    f"{filename}"
                )

                try:
                    destination.unlink()
                except Exception:
                    pass

        # ----------------------------------------------------
        # IMPORTANT:
        # Match full ZIP path first.
        # ----------------------------------------------------

        if url in entries:

            zip_name = url

        else:

            # Fallback only if exactly one basename exists.

            basename = Path(url).name.lower()

            matches = [
                name
                for name in entries
                if Path(name).name.lower()
                == basename
            ]

            if len(matches) == 1:

                zip_name = matches[0]

            elif len(matches) == 0:

                missing.append(url)

                continue

            else:

                print()
                print(
                    "AMBIGUOUS IMAGE:"
                )

                print(
                    f"  Manifest: {url}"
                )

                print(
                    "  Matching ZIP files:"
                )

                for m in matches[:10]:

                    print(
                        f"    {m}"
                    )

                missing.append(url)

                continue

        targets.append(
            (
                url,
                species,
                zip_name,
                entries[zip_name],
                destination,
            )
        )

    # --------------------------------------------------------
    # Plan
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("DOWNLOAD PLAN")
    print("=" * 60)

    print(
        f"Already valid: "
        f"{len(manifest) - len(targets) - len(missing):,}"
    )

    print(
        f"To download: "
        f"{len(targets):,}"
    )

    print(
        f"Missing from ZIP: "
        f"{len(missing):,}"
    )

    if missing:

        print()
        print(
            "First missing:"
        )

        for x in missing[:10]:

            print(
                f"  {x}"
            )

    if not targets:

        print()
        print(
            "Nothing to download."
        )

        return

    # --------------------------------------------------------
    # Download
    # --------------------------------------------------------

    successful = 0

    failed = 0

    start_time = time.time()

    print()
    print("=" * 60)
    print("STARTING DOWNLOAD")
    print("=" * 60)

    for index, (
        url,
        species,
        zip_name,
        info,
        destination,
    ) in enumerate(
        targets,
        start=1,
    ):

        filename = Path(url).name

        print()
        print(
            f"[{index}/{len(targets)}] "
            f"{filename}"
        )

        print(
            f"      Species: {species}"
        )

        print(
            f"      ZIP: {zip_name}"
        )

        try:

            extract_one(
                url,
                info,
                destination,
            )

            successful += 1

            print(
                "      SUCCESS"
            )

        except Exception as exc:

            failed += 1

            print(
                f"      ERROR: {exc}"
            )

            print(
                "      Continuing..."
            )

        # ----------------------------------------------------
        # Progress
        # ----------------------------------------------------

        if (
            index % PROGRESS_EVERY == 0
            or index == len(targets)
        ):

            elapsed = (
                time.time() -
                start_time
            )

            rate = (
                successful / elapsed
                if elapsed > 0
                else 0
            )

            remaining = (
                len(targets) - index
            )

            print()
            print("-" * 60)

            print(
                f"Progress: "
                f"{index}/{len(targets)}"
            )

            print(
                f"Successful: "
                f"{successful}"
            )

            print(
                f"Failed: "
                f"{failed}"
            )

            print(
                f"Remaining: "
                f"{remaining}"
            )

            print(
                f"Rate: "
                f"{rate:.2f} images/sec"
            )

            print("-" * 60)

    # --------------------------------------------------------
    # Final validation
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("DOWNLOAD COMPLETE")
    print("=" * 60)

    print(
        f"Successful this run: "
        f"{successful:,}"
    )

    print(
        f"Failed this run: "
        f"{failed:,}"
    )

    print(
        f"Output directory: "
        f"{OUTPUT_DIR.resolve()}"
    )

    print("=" * 60)


if __name__ == "__main__":
    main()