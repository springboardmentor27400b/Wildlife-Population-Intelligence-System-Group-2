from app.ai.audio_ai import detect_audio


def analyze_audio(audio_path: str):
    return detect_audio(audio_path)