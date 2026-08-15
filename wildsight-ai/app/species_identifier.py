def identify_species(image_result, audio_result):

    image_species = image_result["predictedSpecies"]
    image_confidence = image_result["confidence"]

    audio_species = audio_result["predictedSpecies"]
    audio_confidence = audio_result["confidence"]

    # Case 1: Both agree
    if image_species.lower() == audio_species.lower():

        return {
            "species": image_species,
            "confidence": round(
                (image_confidence + audio_confidence) / 2,
                2
            ),
            "decisionSource": "Image + Audio"
        }

    # Case 2: Image confidence higher
    elif image_confidence >= audio_confidence:

        return {
            "species": image_species,
            "confidence": image_confidence,
            "decisionSource": "Image"
        }

    # Case 3: Audio confidence higher
    else:

        return {
            "species": audio_species,
            "confidence": audio_confidence,
            "decisionSource": "Audio"
        }