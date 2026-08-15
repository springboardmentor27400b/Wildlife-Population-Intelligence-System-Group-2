from birdnet_analyzer import analyze

audio_file = r"D:\projects\wildlife\wildsight-ai\uploads\audio\XC699551 - African Grass Owl - Tyto capensis.mp3"   # <-- change to your audio file

result = analyze(
    audio_input=audio_file,
    output="birdnet_output",
    top_n=5,
    min_conf=0.20
)

print(result)