import librosa
import soundfile as sf
import numpy as np
import os
import uuid


def reduce_noise(audio_path):

    y, sr = librosa.load(audio_path, sr=22050)

    # Simple Noise Gate
    threshold = 0.02

    y_filtered = np.where(np.abs(y) < threshold, 0, y)

    output_dir = "uploads/audio_analysis"

    os.makedirs(output_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}_filtered.wav"

    filtered_path = os.path.join(output_dir, filename)

    sf.write(filtered_path, y_filtered, sr)

    noise_before = round(np.mean(np.abs(y))*100,2)

    noise_after = round(np.mean(np.abs(y_filtered))*100,2)

    reduction = round(
        ((noise_before-noise_after)/noise_before)*100,
        2
    )

    return {

        "filtered_audio": f"/uploads/audio_analysis/{filename}",

        "noise_before": f"{noise_before} %",

        "noise_after": f"{noise_after} %",

        "reduction": f"{reduction} %"

    }