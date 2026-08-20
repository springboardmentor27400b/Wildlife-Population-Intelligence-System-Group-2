import struct
from pathlib import Path


TAIL_FILE = Path("s04_tail.bin")

data = TAIL_FILE.read_bytes()

print("Tail size:", len(data), "bytes")

# Find the End Of Central Directory signature.
EOCD_SIGNATURE = b"PK\x05\x06"
ZIP64_LOCATOR_SIGNATURE = b"PK\x06\x07"
ZIP64_EOCD_SIGNATURE = b"PK\x06\x06"


# EOCD should be near the end of the ZIP.
eocd_pos = data.rfind(EOCD_SIGNATURE)

if eocd_pos == -1:
    raise RuntimeError("EOCD signature was not found in the last 1 MB.")

print("EOCD found at tail offset:", eocd_pos)


# EOCD structure:
# signature       4
# disk number     2
# central disk    2
# entries disk    2
# total entries   2
# central size    4
# central offset  4
# comment length  2

(
    signature,
    disk_number,
    central_disk,
    entries_disk,
    total_entries,
    central_size,
    central_offset,
    comment_length,
) = struct.unpack_from("<4s4H2IH", data, eocd_pos)


print("\n========== EOCD ==========")
print("Disk:", disk_number)
print("Total entries:", total_entries)
print("Central directory size:", central_size)
print("Central directory offset:", central_offset)
print("Comment length:", comment_length)


# Check whether ZIP64 is being used.
zip64_locator_pos = data.rfind(
    ZIP64_LOCATOR_SIGNATURE,
    max(0, eocd_pos - 100),
    eocd_pos,
)


if zip64_locator_pos != -1:

    print("\nZIP64 locator found at:", zip64_locator_pos)

    # ZIP64 locator:
    # signature          4
    # disk with EOCD64   4
    # EOCD64 offset      8
    # total disks        4

    _, zip64_disk, zip64_offset, total_disks = struct.unpack_from(
        "<4sIQI",
        data,
        zip64_locator_pos,
    )

    print("ZIP64 EOCD offset:", zip64_offset)
    print("Total disks:", total_disks)

    zip64_pos = data.find(
        ZIP64_EOCD_SIGNATURE,
        max(0, zip64_locator_pos - 1000),
        zip64_locator_pos,
    )

    if zip64_pos != -1:
        print("ZIP64 EOCD is also in the tail.")

        # ZIP64 EOCD fixed fields:
        # signature       4
        # size            8
        # version made    2
        # version needed  2
        # disk number     4
        # central disk    4
        # entries disk    8
        # total entries   8
        # central size    8
        # central offset  8

        fields = struct.unpack_from(
            "<4sQ2H2I2Q2Q",
            data,
            zip64_pos,
        )

        (
            _,
            record_size,
            version_made,
            version_needed,
            disk_number,
            central_disk,
            entries_disk,
            total_entries,
            central_size,
            central_offset,
        ) = fields

        print("\n========== ZIP64 ==========")
        print("Total entries:", total_entries)
        print("Central directory size:", central_size)
        print("Central directory offset:", central_offset)

else:
    print("\nNo ZIP64 locator found.")