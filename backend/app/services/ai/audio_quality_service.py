import numpy as np
try:
    import librosa
except ImportError:
    librosa = None
try:
    import soundfile
except ImportError:
    soundfile = None

def analyze_audio_quality(audio_path: str) -> dict:
    """
    Performs audio quality analysis on the target audio file.
    Calculates duration, sample rate, number of channels, signal level,
    clipping ratio, silence percentage, background noise level, and overall rating.
    """
    info = soundfile.info(audio_path)
    duration = float(info.duration)
    sample_rate = int(info.samplerate)
    channels = int(info.channels)

    # Load audio to analyze signal properties
    y, sr = librosa.load(audio_path, sr=sample_rate, mono=True)

    # 1. Signal level (RMS)
    if len(y) > 0:
        signal_level = float(np.sqrt(np.mean(y**2)))
    else:
        signal_level = 0.0

    # 2. Clipping detection
    if len(y) > 0:
        clipping_ratio = float(np.mean(np.abs(y) >= 0.99))
        clipping_detected = clipping_ratio > 0.001
    else:
        clipping_ratio = 0.0
        clipping_detected = False

    # 3. Silence percentage
    if len(y) > 0:
        silence_percentage = float(np.mean(np.abs(y) < 0.001) * 100)
    else:
        silence_percentage = 100.0

    # 4. Estimated background noise level
    if len(y) > 0:
        frame_len = int(0.1 * sr)
        hop_len = int(0.05 * sr)
        rms_frames = librosa.feature.rms(y=y, frame_length=frame_len, hop_length=hop_len)
        if rms_frames.size > 0:
            estimated_noise_level = float(np.percentile(rms_frames, 10))
        else:
            estimated_noise_level = 0.0
    else:
        estimated_noise_level = 0.0

    # 5. Overall audio quality score (0 to 100)
    score = 100.0
    
    # Deduct for noise floor
    noise_penalty = min(30.0, estimated_noise_level * 150.0)
    score -= noise_penalty

    # Deduct for clipping
    clipping_penalty = min(30.0, clipping_ratio * 300.0)
    score -= clipping_penalty

    # Deduct for excessive silence
    if silence_percentage > 50.0:
        silence_penalty = min(30.0, (silence_percentage - 50.0) * 0.6)
        score -= silence_penalty

    # Deduct for low sample rate
    if sample_rate < 16000:
        score -= 20.0
    elif sample_rate < 32000:
        score -= 10.0

    # Deduct if audio is extremely short
    if duration < 1.0:
        score -= 30.0
    elif duration < 5.0:
        score -= 10.0

    overall_score = max(0, min(100, round(score)))

    # 6. Overall quality rating
    if overall_score >= 85:
        overall_rating = "Excellent"
    elif overall_score >= 70:
        overall_rating = "Good"
    elif overall_score >= 50:
        overall_rating = "Acceptable"
    else:
        overall_rating = "Poor"

    return {
        "duration": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "signal_level": signal_level,
        "clipping_detected": clipping_detected,
        "silence_percentage": silence_percentage,
        "estimated_noise_level": estimated_noise_level,
        "overall_score": overall_score,
        "overall_rating": overall_rating
    }
