import os

import tensorflow as tf
import tensorflow_hub as hub
import librosa
import numpy as np
import pandas as pd


# =========================================================
# MODEL
# =========================================================

MODEL_URL = "https://tfhub.dev/google/yamnet/1"

model = None


# =========================================================
# YAMNET LABELS
# =========================================================

LABEL_PATH = "app/models/yamnet_class_map.csv"

labels = pd.read_csv(LABEL_PATH)


# =========================================================
# SPECIES / SOUND LABEL MAPPING
# =========================================================

SPECIES_MAP = {
    "dog": "Dog",
    "dog bark": "Dog",
    "bark": "Dog",

    "cat": "Cat",
    "cat meow": "Cat",
    "meow": "Cat",

    "horse": "Horse",
    "cow": "Cow",
    "cattle": "Cow",
    "sheep": "Sheep",
    "goat": "Goat",
    "pig": "Pig",
    "donkey": "Donkey",

    "elephant": "Elephant",

    "lion": "Lion",
    "lion roar": "Lion",

    "tiger": "Tiger",
    "tiger roar": "Tiger",

    "leopard": "Leopard",
    "bear": "Bear",
    "wolf": "Wolf",
    "wolf howl": "Wolf",

    "monkey": "Monkey",
    "chimpanzee": "Chimpanzee",
    "fox": "Fox",
    "deer": "Deer",

    "bird": "Bird",
    "bird vocalization": "Bird",
    "bird song": "Bird",
    "bird call": "Bird",

    "crow": "Crow",
    "owl": "Owl",
    "eagle": "Eagle",
    "duck": "Duck",
    "chicken": "Chicken",
    "rooster": "Rooster",
    "pigeon": "Pigeon",

    "frog": "Frog",
    "frog croak": "Frog",
    "cricket": "Cricket",

    "whale": "Whale",
    "whale vocalization": "Whale",
    "dolphin": "Dolphin",
}


# =========================================================
# VALID ANIMAL LABELS
# =========================================================

ANIMAL_LABELS = set(
    key.lower()
    for key in SPECIES_MAP.keys()
)


# =========================================================
# RECOMMENDATIONS
# =========================================================

RECOMMENDATIONS = {

    "Elephant":
        "Protect migration routes, water sources and forest corridors.",

    "Lion":
        "Protect grassland habitat and continue population monitoring.",

    "Tiger":
        "Protect forest corridors and increase acoustic monitoring.",

    "Leopard":
        "Protect forest habitat and reduce human-wildlife conflict.",

    "Bear":
        "Protect forest habitat and reduce human disturbance.",

    "Wolf":
        "Protect natural habitat and monitor population distribution.",

    "Deer":
        "Maintain forest habitat and monitor population changes.",

    "Monkey":
        "Protect forest habitat and monitor population density.",

    "Bird":
        "Preserve nesting habitats and continue seasonal monitoring.",

    "Owl":
        "Protect nesting areas and preserve forest habitat.",

    "Eagle":
        "Protect nesting areas and reduce habitat disturbance.",

    "Frog":
        "Protect wetland habitats and monitor water quality.",

    "Whale":
        "Protect marine habitat and monitor migration routes.",

    "Dolphin":
        "Monitor marine ecosystems and reduce water pollution.",

    "Unknown":
        "Continue acoustic monitoring and upload a clearer wildlife recording."
}


# =========================================================
# LOAD MODEL
# =========================================================

def load_model():

    global model

    if model is None:

        print("Loading YAMNet...")

        model = hub.load(
            MODEL_URL
        )

        print("YAMNet loaded successfully")

    return model


# =========================================================
# LABEL
# =========================================================

def get_label(index):

    return str(
        labels.iloc[index]["display_name"]
    ).strip()


# =========================================================
# NORMALIZE LABEL
# =========================================================

def normalize_species(label):

    label = label.lower().strip()

    return SPECIES_MAP.get(
        label,
        None
    )


# =========================================================
# CALL TYPE
# =========================================================

def determine_call_type(label):

    label = label.lower()

    if "bark" in label:
        return "Bark"

    if "roar" in label:
        return "Roar"

    if "growl" in label:
        return "Growl"

    if "howl" in label:
        return "Howl"

    if "song" in label:
        return "Song"

    if "bird" in label:
        return "Bird Call"

    if "chirp" in label:
        return "Chirp"

    if "croak" in label:
        return "Croak"

    if "vocalization" in label:
        return "Vocalization"

    return "Animal Sound"


# =========================================================
# FREQUENCY
# =========================================================

def calculate_frequency(
    waveform,
    sample_rate
):

    try:

        if len(waveform) == 0:
            return "Unknown"

        spectrum = np.abs(
            np.fft.rfft(waveform)
        )

        frequencies = np.fft.rfftfreq(
            len(waveform),
            d=1 / sample_rate
        )

        peak_index = np.argmax(
            spectrum
        )

        frequency = frequencies[
            peak_index
        ]

        return f"{round(float(frequency), 2)} Hz"

    except Exception:

        return "Unknown"


# =========================================================
# MAIN AUDIO ANALYSIS
# =========================================================

def predict_audio(audio_path):

    try:

        # -------------------------------------------------
        # 1. Validate
        # -------------------------------------------------

        if not os.path.exists(audio_path):

            raise FileNotFoundError(
                f"Audio file not found: {audio_path}"
            )


        # -------------------------------------------------
        # 2. Load model
        # -------------------------------------------------

        yamnet = load_model()


        # -------------------------------------------------
        # 3. Load audio
        # -------------------------------------------------

        waveform, sample_rate = librosa.load(
            audio_path,
            sr=16000,
            mono=True
        )


        if waveform is None or len(waveform) == 0:

            raise ValueError(
                "Audio file contains no readable audio."
            )


        waveform = waveform.astype(
            np.float32
        )


        # -------------------------------------------------
        # 4. Remove DC offset
        # -------------------------------------------------

        waveform = waveform - np.mean(
            waveform
        )


        # -------------------------------------------------
        # 5. Normalize safely
        # -------------------------------------------------

        peak = np.max(
            np.abs(waveform)
        )

        if peak > 0:

            waveform = waveform / peak


        print(
            "Audio loaded:",
            len(waveform),
            "samples"
        )


        # -------------------------------------------------
        # 6. YAMNet
        # -------------------------------------------------

        scores, embeddings, spectrogram = yamnet(
            waveform
        )

        scores = scores.numpy()


        # -------------------------------------------------
        # 7. Average frames
        # -------------------------------------------------

        mean_scores = np.mean(
            scores,
            axis=0
        )


        # -------------------------------------------------
        # 8. Print top predictions
        # -------------------------------------------------

        top_indices = np.argsort(
            mean_scores
        )[-20:][::-1]


        print("\nTop YAMNet predictions:")

        for index in top_indices[:10]:

            print(
                get_label(index),
                "->",
                round(
                    float(
                        mean_scores[index] * 100
                    ),
                    2
                ),
                "%"
            )


        # -------------------------------------------------
        # 9. Search ALL predictions for exact animal labels
        #
        # IMPORTANT:
        # Do NOT restrict this to top 10.
        # -------------------------------------------------

        animal_candidates = []

        for index in range(
            len(mean_scores)
        ):

            label = get_label(index)

            species = normalize_species(
                label
            )

            if species is None:
                continue

            score = float(
                mean_scores[index]
            )

            animal_candidates.append({
                "species": species,
                "label": label,
                "score": score
            })


        # -------------------------------------------------
        # 10. No recognized species
        # -------------------------------------------------

        if not animal_candidates:

            top_index = int(
                top_indices[0]
            )

            top_label = get_label(
                top_index
            )

            top_confidence = (
                float(
                    mean_scores[top_index]
                ) * 100
            )

            return {

                "category": "Unknown",

                "species": "Unknown",

                "scientific_name": "Unknown",

                "call_type":
                    "Unknown",

                "habitat":
                    "Unknown",

                "conservation_status":
                    "Unknown",

                "confidence":
                    round(
                        top_confidence,
                        2
                    ),

                "event":
                    "Non-animal sound",

                "event_description":
                    f"Detected sound: {top_label}",

                "dominant_frequency":
                    calculate_frequency(
                        waveform,
                        sample_rate
                    ),

                "duration":
                    round(
                        len(waveform) /
                        sample_rate,
                        2
                    ),

                "animal_count":
                    0,

                "distance":
                    "Unknown",

                "recommendation":
                    RECOMMENDATIONS[
                        "Unknown"
                    ]
            }


        # -------------------------------------------------
        # 11. Combine duplicate labels belonging
        #     to the same species
        # -------------------------------------------------

        species_scores = {}

        species_labels = {}

        for candidate in animal_candidates:

            species = candidate[
                "species"
            ]

            score = candidate[
                "score"
            ]

            species_scores.setdefault(
                species,
                []
            ).append(score)

            species_labels.setdefault(
                species,
                []
            ).append(
                candidate["label"]
            )


        # -------------------------------------------------
        # 12. Score species
        #
        # Average + strongest evidence
        # -------------------------------------------------

        final_species_scores = {}

        for species, values in species_scores.items():

            strongest = max(values)

            average = float(
                np.mean(values)
            )

            # Strongest evidence matters most.
            final_score = (
                strongest * 0.75
                +
                average * 0.25
            )

            final_species_scores[
                species
            ] = final_score


        # -------------------------------------------------
        # 13. Best species
        # -------------------------------------------------

        best_species = max(
            final_species_scores,
            key=final_species_scores.get
        )

        confidence = (
            final_species_scores[
                best_species
            ] * 100
        )


        # -------------------------------------------------
        # 14. Safety threshold
        #
        # YAMNet is NOT a dedicated species model.
        # Don't confidently report weak predictions.
        # -------------------------------------------------

        if confidence < 25:

            top_index = int(
                top_indices[0]
            )

            top_label = get_label(
                top_index
            )

            return {

                "category": "Unknown",

                "species": "Unknown",

                "scientific_name": "Unknown",

                "call_type":
                    "Unknown",

                "habitat":
                    "Unknown",

                "conservation_status":
                    "Unknown",

                "confidence":
                    round(
                        confidence,
                        2
                    ),

                "event":
                    "Uncertain Animal Sound",

                "event_description":
                    f"Possible animal sound, but species confidence is low: {top_label}",

                "dominant_frequency":
                    calculate_frequency(
                        waveform,
                        sample_rate
                    ),

                "duration":
                    round(
                        len(waveform) /
                        sample_rate,
                        2
                    ),

                "animal_count":
                    1,

                "distance":
                    "Unknown",

                "recommendation":
                    RECOMMENDATIONS[
                        "Unknown"
                    ]
            }


        # -------------------------------------------------
        # 15. Call type
        # -------------------------------------------------

        labels_for_species = species_labels[
            best_species
        ]

        primary_label = labels_for_species[
            0
        ]

        call_type = determine_call_type(
            primary_label
        )


        # -------------------------------------------------
        # 16. Frequency
        # -------------------------------------------------

        frequency = calculate_frequency(
            waveform,
            sample_rate
        )


        # -------------------------------------------------
        # 17. Duration
        # -------------------------------------------------

        duration = round(
            len(waveform) /
            sample_rate,
            2
        )


        # -------------------------------------------------
        # 18. Recommendation
        # -------------------------------------------------

        recommendation = RECOMMENDATIONS.get(
            best_species,
            RECOMMENDATIONS["Unknown"]
        )


        # -------------------------------------------------
        # 19. Final result
        # -------------------------------------------------

        return {

            "category":
                "Animal",

            "species":
                best_species,

            "scientific_name":
                "Unknown",

            "call_type":
                call_type,

            "habitat":
                "Unknown",

            "conservation_status":
                "Unknown",

            "confidence":
                round(
                    confidence,
                    2
                ),

            "event":
                "Wildlife Activity",

            "event_description":
                f"Detected acoustic class: {primary_label}",

            "dominant_frequency":
                frequency,

            "duration":
                duration,

            "pitch":
                "Audio-based",

            "signal_strength":
                "Measured from recording",

            "complexity":
                "YAMNet",

            "pattern":
                primary_label,

            "quality":
                "Processed",

            "waveform":
                None,

            "spectrogram":
                None,

            "filtered_audio":
                None,

            "noise_before":
                None,

            "noise_after":
                None,

            "noise_reduction":
                0,

            "noise_level":
                "Unknown",

            "animal_count":
                1,

            "distance":
                "Unknown",

            "recommendation":
                recommendation
        }


    except Exception as e:

        print(
            "Audio Prediction Error:",
            str(e)
        )

        return {

            "category":
                "Unknown",

            "species":
                "Unknown",

            "scientific_name":
                "Unknown",

            "call_type":
                "Unknown",

            "habitat":
                "Unknown",

            "conservation_status":
                "Unknown",

            "confidence":
                0,

            "event":
                "Analysis Error",

            "event_description":
                str(e),

            "animal_count":
                0,

            "distance":
                "Unknown",

            "recommendation":
                "Unable to analyze this audio recording."
        }