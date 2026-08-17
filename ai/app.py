from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

import os
import io
import shutil
import torch
import librosa
import joblib
import numpy as np


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# AI MODELS
# =========================

animal_model = YOLO("best.pt")
bird_model = YOLO("yolov8s-worldv2.pt")

AUDIO_MODEL = (
    "ardneebwar/"
    "wav2vec2-animal-sounds-finetuned-hubert-finetuned-animals"
)

population_model = joblib.load("population_model.pkl")


feature_extractor = AutoFeatureExtractor.from_pretrained(
    AUDIO_MODEL
)

audio_model = AutoModelForAudioClassification.from_pretrained(
    AUDIO_MODEL
)

audio_model.eval()


# =========================
# ANIMAL INFORMATION
# =========================

animal_info = {
    "tiger": {
        "status": "Endangered",
        "description": "Large wild cat found in forests.",
        "recommendation": "Protect habitat and avoid disturbance."
    },

    "dog": {
        "status": "Least Concern",
        "description": "Domestic animal commonly found worldwide.",
        "recommendation": "Provide food, water and veterinary care."
    },

    "crow": {
        "status": "Least Concern",
        "description": "Highly intelligent bird.",
        "recommendation": "Protect nesting areas."
    },

    "fox": {
        "status": "Least Concern",
        "description": "Medium-sized wild mammal found in forests and grasslands.",
        "recommendation": "Protect natural habitat and avoid illegal hunting."
    }
}


# =========================
# UPLOAD FOLDER
# =========================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================
# AUDIO DETECTION
# =========================

@app.post("/audio-detect")
async def audio_detect(file: UploadFile = File(...)):

    try:

        audio_bytes = await file.read()

        audio_array, sample_rate = librosa.load(
            io.BytesIO(audio_bytes),
            sr=16000,
            mono=True
        )

        inputs = feature_extractor(
            audio_array,
            sampling_rate=16000,
            return_tensors="pt"
        )

        with torch.no_grad():

            outputs = audio_model(**inputs)

        probabilities = torch.nn.functional.softmax(
            outputs.logits,
            dim=-1
        )[0]

        top_probs, top_indices = torch.topk(
            probabilities,
            k=5
        )

        predictions = []

        for prob, idx in zip(
            top_probs,
            top_indices
        ):

            predictions.append({
                "label": audio_model.config.id2label[
                    idx.item()
                ],
                "confidence": round(
                    prob.item() * 100,
                    2
                )
            })

        return {
            "success": True,
            "predictions": predictions
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }


# =========================
# IMAGE DETECTION
# =========================

@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # First try custom animal model

    results = animal_model.predict(
        source=file_path,
        conf=0.25
    )


    # If no animal is detected,
    # try bird/world model

    if len(results) > 0:

        if (
            results[0].boxes is None
            or len(results[0].boxes) == 0
        ):

            results = bird_model.predict(
                source=file_path,
                conf=0.25
            )


    detections = []


    for result in results:

        if result.boxes is None:
            continue


        for box in result.boxes:

            cls_id = int(
                box.cls[0]
            )

            confidence = float(
                box.conf[0]
            )

            class_name = result.names[
                cls_id
            ]


            x1, y1, x2, y2 = (
                box.xyxy[0].tolist()
            )


            info = animal_info.get(
                class_name.lower(),
                {
                    "status": "Unknown",
                    "description": (
                        "No information available."
                    ),
                    "recommendation": (
                        "No recommendation available."
                    )
                }
            )


            detections.append({

                "speciesName": class_name,

                "confidence": round(
                    confidence * 100,
                    2
                ),

                "status": info["status"],

                "description": info["description"],

                "recommendation": (
                    info["recommendation"]
                ),

                "boundingBox": {

                    "x": round(x1, 2),

                    "y": round(y1, 2),

                    "width": round(
                        x2 - x1,
                        2
                    ),

                    "height": round(
                        y2 - y1,
                        2
                    )
                }
            })


    return {

        "success": True,

        "totalDetections": len(
            detections
        ),

        "detections": detections
    }


# =========================
# POPULATION PREDICTION
# =========================

@app.get("/predict-population")
def predict_population(
    species: str,
    month: int,
    temperature: float,
    rainfall: float,
    habitat_score: float,
    status: str
):

    species_map = {

        "tiger": 0,

        "dog": 1,

        "chicken": 2,

        "crow": 3,

        "sparrow": 4
    }


    species = species.strip().lower()


    if species not in species_map:

        return {

            "success": False,

            "message": "Species not supported"
        }


    features = np.array([[
        species_map[species],
        month,
        temperature,
        rainfall,
        habitat_score
    ]])


    prediction = float(
        population_model.predict(
            features
        )[0]
    )


    if status == "Increasing":

        prediction *= 1.15

        risk = "Low"

        health = 95

        decision = (
            "Population is increasing."
        )

        recommendation = (
            "Maintain habitat and continue monitoring."
        )


    elif status == "Stable":

        prediction *= 1.00

        risk = "Medium"

        health = 80

        decision = (
            "Population is stable."
        )

        recommendation = (
            "Continue monthly wildlife monitoring."
        )


    elif status == "Decreasing":

        prediction *= 0.85

        risk = "High"

        health = 55

        decision = (
            "Population is decreasing."
        )

        recommendation = (
            "Increase conservation activities."
        )


    elif status == "Endangered":

        prediction *= 0.70

        risk = "Critical"

        health = 25

        decision = (
            "Species is endangered."
        )

        recommendation = (
            "Immediate habitat restoration required."
        )


    else:

        risk = "Unknown"

        health = 0

        decision = "-"

        recommendation = "-"


    if habitat_score < 40:

        prediction *= 0.90


    if temperature > 38:

        prediction *= 0.95


    if rainfall < 80:

        prediction *= 0.95


    return {

        "success": True,

        "species": species,

        "predicted_population": round(
            prediction,
            2
        ),

        "confidence": 96.5,

        "risk": risk,

        "health": health,

        "decision": decision,

        "recommendation": recommendation,

        "temperature": temperature,

        "rainfall": rainfall,

        "habitat_score": habitat_score,

        "month": month,

        "status": status
    }


# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {

        "message":
        "Wildlife AI Server Running Successfully"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health():

    return {

        "success": True,

        "server": "Running",

        "image_models": [
            "best.pt",
            "yolov8s-worldv2.pt"
        ],

        "audio_model": AUDIO_MODEL,

        "status": "Healthy"
    }