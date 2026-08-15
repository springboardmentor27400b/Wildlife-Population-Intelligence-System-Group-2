from species_identifier import identify_species

tests = [
    (
        {"predictedSpecies": "Tiger", "confidence": 96.2},
        {"predictedSpecies": "Tiger", "confidence": 90.6}
    ),
    (
        {"predictedSpecies": "Tiger", "confidence": 95},
        {"predictedSpecies": "Lion", "confidence": 72}
    ),
    (
        {"predictedSpecies": "Wolf", "confidence": 55},
        {"predictedSpecies": "Wolf", "confidence": 90}
    )
]

for i, (image, audio) in enumerate(tests, start=1):
    print(f"\n===== Test Case {i} =====")
    print(identify_species(image, audio))