from app.birdnet_predictor import predict_bird


def predict_audio(audio_path):


    # CALL BIRDNET

    prediction = predict_bird(
        audio_path
    )


    return {


        "status":
            prediction.get(
                "status",
                "SUCCESS"
            ),



        "species":
            prediction.get(
                "species",
                "Unknown"
            ),



        "speciesCode":
            prediction.get(
                "speciesCode"
            ),



        "scientificName":
            prediction.get(
                "scientificName",
                "Not Available"
            ),



        "confidence":
            prediction.get(
                "confidence",
                0
            ),



        "category":
            prediction.get(
                "category",
                "Bird"
            ),



        "soundType":
            prediction.get(
                "soundType",
                "Bird Call"
            ),



        "conservationStatus":
            prediction.get(
                "conservationStatus",
                "Unknown"
            ),



        "environmentNoise":
            prediction.get(
                "environmentNoise",
                "Unknown"
            ),



        "noiseFiltered":
            prediction.get(
                "noiseFiltered",
                False
            ),



        # TAXONOMY

        "kingdom":
            prediction.get(
                "kingdom"
            ),



        "phylum":
            prediction.get(
                "phylum"
            ),



        "className":
            prediction.get(
                "className"
            ),



        "order":
            prediction.get(
                "order"
            ),



        "family":
            prediction.get(
                "family"
            ),



        "genus":
            prediction.get(
                "genus"
            ),



        "model":
            "BirdNET Analyzer"

    }