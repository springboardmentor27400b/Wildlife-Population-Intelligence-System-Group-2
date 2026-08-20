from pathlib import Path

CENTRAL = (
    Path("s04_central.bin").read_bytes()
    + Path("s04_central_part2.bin").read_bytes()
)

TARGET = b"S4/N06/N06_R2/S4_N06_R2_IMAG1059.JPG"

print("Central directory:", len(CENTRAL), "bytes")
print("Searching raw bytes for:")
print(TARGET.decode())

position = CENTRAL.find(TARGET)

if position == -1:
    print("\nTARGET NOT FOUND in central directory.")
else:
    print("\n========== TARGET FOUND ==========")
    print("Filename offset:", position)

    start = max(0, position - 200)
    end = min(len(CENTRAL), position + len(TARGET) + 200)

    print("\nContext:")
    print(CENTRAL[start:end])

    print("\n==================================")