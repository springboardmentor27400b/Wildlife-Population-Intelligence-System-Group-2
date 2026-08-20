from app.ai.bird_detector import detect_birds


audio_path = "uploads/audio/lion.mp3"

results = detect_birds(audio_path)

print("\nBirdNET Results:")

for result in results:
    print(result)