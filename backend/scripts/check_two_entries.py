import struct

CENTRAL = "s04_central_full.bin"

TARGETS = {
    "S4/N06/N06_R1/S4_N06_R1_IMAG1059.JPG",
    "S4/N06/N06_R2/S4_N06_R2_IMAG1059.JPG",
}


def parse_zip64_extra(
    extra,
    compressed_size,
    uncompressed_size,
    local_offset,
):
    """
    Parse ZIP64 extra field 0x0001.

    Values appear only for fields whose corresponding
    central-directory value is 0xFFFFFFFF.
    """

    pos = 0

    while pos + 4 <= len(extra):

        field_id, field_size = struct.unpack(
            "<HH",
            extra[pos:pos + 4],
        )

        field_start = pos + 4
        field_end = field_start + field_size

        if field_end > len(extra):
            break

        field_data = extra[field_start:field_end]

        if field_id == 0x0001:

            q = 0

            if uncompressed_size == 0xFFFFFFFF:
                if q + 8 > len(field_data):
                    raise RuntimeError(
                        "Invalid ZIP64 extra field: "
                        "missing uncompressed size"
                    )

                uncompressed_size = struct.unpack(
                    "<Q",
                    field_data[q:q + 8],
                )[0]

                q += 8

            if compressed_size == 0xFFFFFFFF:
                if q + 8 > len(field_data):
                    raise RuntimeError(
                        "Invalid ZIP64 extra field: "
                        "missing compressed size"
                    )

                compressed_size = struct.unpack(
                    "<Q",
                    field_data[q:q + 8],
                )[0]

                q += 8

            if local_offset == 0xFFFFFFFF:
                if q + 8 > len(field_data):
                    raise RuntimeError(
                        "Invalid ZIP64 extra field: "
                        "missing local offset"
                    )

                local_offset = struct.unpack(
                    "<Q",
                    field_data[q:q + 8],
                )[0]

                q += 8

            break

        pos = field_end

    return (
        compressed_size,
        uncompressed_size,
        local_offset,
    )


data = open(CENTRAL, "rb").read()

print("Central size:", len(data))
print("Central entries:", data.count(b"PK\x01\x02"))

signature = b"PK\x01\x02"

pos = 0
found = {}

while pos + 46 <= len(data):

    idx = data.find(signature, pos)

    if idx < 0:
        break

    header = data[idx:idx + 46]

    values = struct.unpack(
        "<4s6H3I5H2I",
        header,
    )

    filename_length = values[10]
    extra_length = values[11]
    comment_length = values[12]

    filename_start = idx + 46
    filename_end = filename_start + filename_length

    extra_start = filename_end
    extra_end = extra_start + extra_length

    comment_end = extra_end + comment_length

    if comment_end > len(data):
        break

    filename = data[
        filename_start:filename_end
    ].decode(
        "utf-8",
        errors="replace",
    )

    extra = data[
        extra_start:extra_end
    ]

    (
        compressed_size,
        uncompressed_size,
        local_offset,
    ) = parse_zip64_extra(
        extra,
        values[8],
        values[9],
        values[16],
    )

    if filename in TARGETS:

        found[filename] = {
            "central_position": idx,
            "local_offset": local_offset,
            "crc32": values[7],
            "compressed_size": compressed_size,
            "uncompressed_size": uncompressed_size,
            "flags": values[3],
            "compression": values[4],
            "filename_length": filename_length,
            "extra_length": extra_length,
        }

    pos = comment_end


print()
print("========== ZIP64 RESULTS ==========")

for filename, info in found.items():

    print()
    print(filename)

    for key, value in info.items():
        print(f"  {key}: {value}")

print()
print("Found:", len(found), "/", len(TARGETS))