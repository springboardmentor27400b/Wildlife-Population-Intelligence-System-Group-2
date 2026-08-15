from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.audio_detection import detect_audio_species
from app.audio_prediction import predict_audio
from app.audio_constants import UPLOAD_AUDIO
from app.species_api import router as species_router
from app.yolo_detection import detect_animals
from app.prediction import predict_species
from app.image_quality import assess_image_quality

import os
import shutil


app = FastAPI(
    title="WildSight AI Service",
    description="AI Powered Wildlife Species Recognition API",
    version="1.0.0"
)


app.include_router(
    species_router
)


# =========================================================
# UPLOAD DIRECTORIES
# =========================================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    "uploads/annotated",
    exist_ok=True
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory="uploads"
    ),
    name="uploads"
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Welcome to WildSight AI",
        "status": "Running",
        "service": "Wildlife Image Recognition"
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "Healthy",
        "tensorflow": "Loaded",
        "ready": True
    }


# =========================================================
# IMAGE PREDICTION
# =========================================================

@app.post("/predict-image")
async def predict_image(
    file: UploadFile = File(...)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    prediction = predict_species(
        file_path
    )

    return JSONResponse({

        "status": "SUCCESS",

        "predictedSpecies":
            prediction["species"].title(),

        "confidence":
            prediction["confidence"],

        "model":
            "MobileNetV2"

    })


# =========================================================
# AUDIO PREDICTION
# =========================================================

@app.post("/predict-audio")
async def predict_audio_api(
    file: UploadFile = File(...)
):

    file_path = (
        UPLOAD_AUDIO
        / file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return predict_audio(
        file_path
    )


# =========================================================
# ANIMAL DETECTION
# =========================================================

@app.post("/detect-animals")
async def detect_animals_api(
    file: UploadFile = File(...)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    result = detect_animals(
        file_path
    )

    return result


# =========================================================
# IMAGE QUALITY
# =========================================================

@app.post("/image-quality")
async def image_quality(
    file: UploadFile = File(...)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    result = assess_image_quality(
        file_path
    )

    return {

        "status": "SUCCESS",

        "imageQuality": result

    }