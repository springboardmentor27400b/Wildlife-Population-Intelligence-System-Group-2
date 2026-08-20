from pathlib import Path
import zipfile
import fsspec


PROJECT_ROOT = Path(__file__).resolve().parents[2]

OUTPUT_DIR = (
    PROJECT_ROOT
    / "datasets"
    / "snapshot_serengeti"
    / "test_images"
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Season 4 remote ZIP
ZIP_URL = (
    "http://us-west-2.opendata.source.coop/"
    "agentmorris/lila-wildlife/"
    "snapshotserengeti-v-2-0/"
    "SnapshotSerengeti_S04_v2_0.zip"
)


TARGET_FILENAME = "S4_B04_R1_IMAG0594.JPG"


print("\nConnecting to remote Snapshot Serengeti ZIP...")
print("This should NOT download the 395 GB ZIP.\n")


with fsspec.open(ZIP_URL, "rb") as remote_file:

    with zipfile.ZipFile(remote_file) as zf:

        print("Remote ZIP opened successfully.")
        print("Searching for:", TARGET_FILENAME)

        matches = [
            name
            for name in zf.namelist()
            if name.endswith(TARGET_FILENAME)
        ]

        print("\nMatches found:", len(matches))

        for match in matches[:10]:
            print(match)

        if not matches:
            raise FileNotFoundError(
                f"Could not find {TARGET_FILENAME} "
                "inside the remote ZIP."
            )

        selected_file = matches[0]

        print("\nSelected file:")
        print(selected_file)

        output_file = OUTPUT_DIR / TARGET_FILENAME

        print("\nDownloading ONLY this image...")
        print("Output:", output_file)

        with zf.open(selected_file) as source:
            with open(output_file, "wb") as destination:

                while True:
                    chunk = source.read(1024 * 1024)

                    if not chunk:
                        break

                    destination.write(chunk)


print("\n===================================")
print("Test image downloaded successfully!")
print("===================================")
print(output_file)