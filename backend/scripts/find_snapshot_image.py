from pathlib import Path

PART1 = Path("s04_central.bin")
PART2 = Path("s04_central_part2.bin")

TARGET = b"S4/B04/B04_R1/S4_B04_R1_IMAG0594.JPG"

central = PART1.read_bytes() + PART2.read_bytes()

print("Central directory size:", len(central))
print("Searching for:", TARGET.decode())

position = central.find(TARGET)

if position == -1:
    print("\nTARGET NOT FOUND")
else:
    print("\n========== TARGET FOUND ==========")
    print("Filename position in central directory:", position)
    print("=================================")

    # Show bytes around the filename.
    start = max(0, position - 100)
    end = min(len(central), position + len(TARGET) + 100)

    print("\nNearby data:")
    print(central[start:end])