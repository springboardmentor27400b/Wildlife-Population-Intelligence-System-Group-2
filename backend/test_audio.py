from app.ai.audio_ai import detect_audio


audio_path = "uploads\audio\4e82ed04-dde7-4ca7-9e33-b7362c1ef073.wav"

result = detect_audio(audio_path)

print("\n========== AUDIO RESULT ==========")

print("Label:")
print(result["label"])

print("\nConfidence:")
print(result["confidence"])

print("\nTop Predictions:")

for prediction in result["top_predictions"]:
    print(
        prediction["label"],
        "->",
        prediction["confidence"]
    )