import os
import gc
import json
import urllib.request
import numpy as np
try:
    import tensorflow as tf
except ImportError:
    tf = None
try:
    import librosa
except ImportError:
    librosa = None

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "birdnet"))
MODEL_PATH = os.path.join(MODEL_DIR, "BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite")
LABELS_PATH = os.path.join(MODEL_DIR, "BirdNET_GLOBAL_6K_V2.4_Labels.txt")

MODEL_URL = "https://huggingface.co/justinchuby/BirdNET-onnx/resolve/main/BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite"
LABELS_URL = "https://huggingface.co/justinchuby/BirdNET-onnx/resolve/main/BirdNET_GLOBAL_6K_V2.4_Labels.txt"

def ensure_birdnet_model_downloaded():
    """
    Guarantees BirdNET model files are downloaded and stored locally.
    Generates metadata.json, taxonomy.json, and configuration.json if missing.
    """
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR, exist_ok=True)

    # 1. Download Model TFLite file
    if not os.path.exists(MODEL_PATH):
        print(f"Downloading BirdNET Model to {MODEL_PATH}...")
        req = urllib.request.Request(MODEL_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(MODEL_PATH, 'wb') as out_file:
            out_file.write(response.read())
        print("Model downloaded successfully.")

    # 2. Download Labels file
    if not os.path.exists(LABELS_PATH):
        print(f"Downloading BirdNET Labels to {LABELS_PATH}...")
        req = urllib.request.Request(LABELS_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(LABELS_PATH, 'wb') as out_file:
            out_file.write(response.read())
        print("Labels downloaded successfully.")

    # 3. Create metadata.json if missing
    metadata_path = os.path.join(MODEL_DIR, "metadata.json")
    if not os.path.exists(metadata_path):
        metadata = {
            "model_name": "BirdNET",
            "model_version": "2.4",
            "classes_count": 6522,
            "license": "CC BY-NC-SA 4.0",
            "author": "Cornell Lab of Ornithology and TU Chemnitz",
            "source": "https://huggingface.co/justinchuby/BirdNET-onnx"
        }
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=4)

    # 4. Create configuration.json if missing
    config_path = os.path.join(MODEL_DIR, "configuration.json")
    if not os.path.exists(config_path):
        config = {
            "sample_rate": 48000,
            "segment_length_seconds": 3,
            "input_samples": 144000,
            "default_confidence_threshold": 0.15
        }
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4)

    # 5. Create taxonomy.json if missing
    taxonomy_path = os.path.join(MODEL_DIR, "taxonomy.json")
    if not os.path.exists(taxonomy_path):
        taxonomy = {}
        if os.path.exists(LABELS_PATH):
            with open(LABELS_PATH, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        parts = line.split('_')
                        scientific = parts[0]
                        common = parts[1] if len(parts) > 1 else parts[0]
                        sci_parts = scientific.split(' ')
                        genus = sci_parts[0] if len(sci_parts) > 0 else ""
                        species = sci_parts[1] if len(sci_parts) > 1 else ""
                        taxonomy[line] = {
                            "genus": genus,
                            "species": species,
                            "scientific_name": scientific,
                            "common_name": common
                        }
            with open(taxonomy_path, 'w', encoding='utf-8') as f:
                json.dump(taxonomy, f, indent=4)


def load_labels() -> list:
    """
    Loads labels list from text file.
    """
    labels = []
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    labels.append(line)
    return labels


def load_taxonomy() -> dict:
    """
    Loads species taxonomy lookup dictionary.
    """
    taxonomy_path = os.path.join(MODEL_DIR, "taxonomy.json")
    if os.path.exists(taxonomy_path):
        with open(taxonomy_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def run_birdnet_inference(audio_path: str) -> dict:
    """
    Loads BirdNET model, parses labels, executes segment-by-segment inference,
    gathers vocalizations/events, and cleanups resources.
    """
    # 1. Guarantee models downloaded
    ensure_birdnet_model_downloaded()

    # 2. Load labels and taxonomy
    labels = load_labels()
    taxonomy = load_taxonomy()

    if not labels:
        raise ValueError("BirdNET labels file is empty or missing.")

    # 3. Load audio file (Librosa handles automatic resampling to 48 kHz)
    y, sr = librosa.load(audio_path, sr=48000, mono=True)
    duration = float(len(y) / sr)

    # Segment audio into 3s chunks (144000 samples)
    chunk_samples = 144000
    segments = []
    for offset in range(0, len(y), chunk_samples):
        chunk = y[offset:offset+chunk_samples]
        if len(chunk) < chunk_samples:
            chunk = np.pad(chunk, (0, chunk_samples - len(chunk)), 'constant')
        segments.append(chunk)

    if not segments:
        segments.append(np.zeros(chunk_samples, dtype=np.float32))

    # 4. Instantiate interpreter ONLY when inference begins
    interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    input_index = input_details[0]['index']
    output_index = output_details[0]['index']

    detected_events = []
    max_confidence_by_species = {}

    confidence_threshold = 0.15

    # 5. Run inference chunk-by-chunk
    for i, segment in enumerate(segments):
        start_time = float(i * 3.0)
        end_time = float(start_time + 3.0)
        if end_time > duration:
            end_time = duration

        # Reshape to expected input [1, 144000]
        input_data = np.expand_dims(segment, axis=0).astype(np.float32)
        interpreter.set_tensor(input_index, input_data)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_index)

        # Apply sigmoid to raw logits
        sigmoid_scores = 1.0 / (1.0 + np.exp(-output_data[0]))

        # Find all species above threshold in this chunk
        for idx, score in enumerate(sigmoid_scores):
            score = float(score)
            label_str = labels[idx]
            tax_info = taxonomy.get(label_str, {
                "genus": "",
                "species": "",
                "scientific_name": label_str,
                "common_name": label_str
            })

            # Check if this is a generic class (non-bird species)
            if tax_info["scientific_name"] == tax_info["common_name"]:
                continue

            if score >= confidence_threshold:
                event = {
                    "start_time": start_time,
                    "end_time": end_time,
                    "species": tax_info["common_name"],
                    "scientific_name": tax_info["scientific_name"],
                    "common_name": tax_info["common_name"],
                    "confidence": score
                }
                detected_events.append(event)

            # Keep track of the maximum confidence for each species across all chunks
            if label_str not in max_confidence_by_species or score > max_confidence_by_species[label_str]:
                max_confidence_by_species[label_str] = score

    # 6. Release interpreter resources
    del interpreter
    gc.collect()

    # Determine primary prediction and top 5 predictions
    sorted_predictions = sorted(max_confidence_by_species.items(), key=lambda item: item[1], reverse=True)

    # Fallback if no prediction is above threshold
    if not sorted_predictions:
        # Default fallback species: find the first non-generic label
        primary_label = None
        for lbl in labels:
            tax = taxonomy.get(lbl, {"scientific_name": lbl, "common_name": lbl})
            if tax["scientific_name"] != tax["common_name"]:
                primary_label = lbl
                break
        if primary_label is None:
            primary_label = labels[0]
        primary_confidence = 0.0
    else:
        primary_label, primary_confidence = sorted_predictions[0]

    primary_tax = taxonomy.get(primary_label, {
        "genus": "",
        "species": "",
        "scientific_name": primary_label,
        "common_name": primary_label
    })

    # Build Top 5
    top5_predictions = []
    for label, conf in sorted_predictions[:5]:
        tax_info = taxonomy.get(label, {
            "genus": "",
            "species": "",
            "scientific_name": label,
            "common_name": label
        })
        top5_predictions.append({
            "species": tax_info["common_name"],
            "scientific_name": tax_info["scientific_name"],
            "common_name": tax_info["common_name"],
            "confidence": conf
        })

    # Fill up to 5 if less than 5 are available (using labels as placeholders, filtering out generic ones)
    placeholder_idx = 0
    while len(top5_predictions) < 5 and placeholder_idx < len(labels):
        p_label = labels[placeholder_idx]
        placeholder_idx += 1
        p_tax = taxonomy.get(p_label, {
            "genus": "",
            "species": "",
            "scientific_name": p_label,
            "common_name": p_label
        })
        if p_tax["scientific_name"] == p_tax["common_name"]:
            continue
        # Also avoid duplicating species already in top5_predictions
        if any(item["scientific_name"] == p_tax["scientific_name"] for item in top5_predictions):
            continue
        top5_predictions.append({
            "species": p_tax["common_name"],
            "scientific_name": p_tax["scientific_name"],
            "common_name": p_tax["common_name"],
            "confidence": 0.0
        })

    # Call quality analyzer internally as part of overall pipeline (existing requirement)
    from app.services.ai.audio_quality_service import analyze_audio_quality
    quality_report = analyze_audio_quality(audio_path)

    return {
        "detected_species": primary_tax["common_name"],
        "scientific_name": primary_tax["scientific_name"],
        "common_name": primary_tax["common_name"],
        "confidence": primary_confidence,
        "top5_predictions": top5_predictions,
        "detected_events": detected_events,
        "audio_quality": quality_report,
        "taxonomy": primary_tax
    }
