import librosa

def preprocess_audio(audio_path):

    signal, sample_rate = librosa.load(
        audio_path,
        sr=16000,
        mono=True
    )

    return signal, sample_rate