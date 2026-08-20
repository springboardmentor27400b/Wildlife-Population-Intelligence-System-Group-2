import struct


CENTRAL_FILE = "s04_central_full.bin"

TARGET = "S4/N06/N06_R2/S4_N06_R2_IMAG1059.JPG"


def parse_entry(data, pos):

    if data[pos:pos + 4] != b"PK\x01\x02":
        return None

    fields = struct.unpack_from(
        "<4s6H3I5H2I",
        data,
        pos
    )

    (
        signature,
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
        local_header_offset,
    ) = fields

    filename_start = pos + 46
    filename_end = filename_start + filename_length

    extra_start = filename_end
    extra_end = extra_start + extra_length

    comment_end = extra_end + comment_length

    filename = data[
        filename_start:filename_end
    ].decode("utf-8", errors="replace")

    extra = data[
        extra_start:extra_end
    ]

    if local_header_offset == 0xFFFFFFFF:

        p = 0

        while p + 4 <= len(extra):

            header_id, size = struct.unpack_from(
                "<HH",
                extra,
                p
            )

            field = extra[
                p + 4:p + 4 + size
            ]

            if header_id == 0x0001:

                q = 0

                if uncompressed_size == 0xFFFFFFFF:
                    q += 8

                if compressed_size == 0xFFFFFFFF:
                    q += 8

                local_header_offset = struct.unpack_from(
                    "<Q",
                    field,
                    q
                )[0]

                break

            p += 4 + size

    return (
        filename,
        local_header_offset,
        compression,
        compressed_size,
        uncompressed_size,
        comment_end,
    )


with open(CENTRAL_FILE, "rb") as f:
    data = f.read()

pos = 0
count = 0

while pos + 46 <= len(data):

    if data[pos:pos + 4] != b"PK\x01\x02":
        pos += 1
        continue

    result = parse_entry(data, pos)

    if result is None:
        pos += 1
        continue

    (
        filename,
        offset,
        compression,
        compressed_size,
        uncompressed_size,
        next_pos,
    ) = result

    count += 1

    if filename == TARGET:

        print()
        print("========== FOUND ==========")
        print("Filename:", filename)
        print("Local header offset:", offset)
        print("Compression:", compression)
        print("Compressed size:", compressed_size)
        print("Uncompressed size:", uncompressed_size)
        print("===========================")

        break

    pos = next_pos

print()
print("Entries examined:", count)