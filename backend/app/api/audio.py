import os
import shutil
from pathlib import Path
from uuid import uuid4

from beanie import PydanticObjectId
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.ai.audio_detector import detect_audio
from app.ai.bird_detector import detect_birds
from app.dependencies.auth import get_current_user
from app.models.audio import (
    AudioUpload,
    Prediction,
    BirdPrediction,
)


router = APIRouter(
    prefix="/audio",
    tags=["Audio"],
)


# ==========================================
# AUDIO UPLOAD DIRECTORY
# ==========================================

UPLOAD_DIR = Path("uploads/audio")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================
# GET AUDIO BY ID
# ==========================================

async def get_audio(audio_id: str) -> AudioUpload:

    try:
        audio = await AudioUpload.get(
            PydanticObjectId(audio_id)
        )

    except Exception:
        audio = None

    if not audio:
        raise HTTPException(
            status_code=404,
            detail="Audio not found."
        )

    return audio


# ==========================================
# UPLOAD AUDIO
# ==========================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
async def upload_audio(
    audio: UploadFile = File(...),
    current_user=Depends(get_current_user),
):

    # --------------------------------------
    # Generate unique filename
    # --------------------------------------

    extension = (
        audio.filename.split(".")[-1]
        if audio.filename and "." in audio.filename
        else "wav"
    )

    unique_filename = (
        f"{uuid4()}.{extension}"
    )

    filepath = (
        UPLOAD_DIR / unique_filename
    )


    # --------------------------------------
    # Save audio file
    # --------------------------------------

    with open(
        filepath,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            audio.file,
            buffer
        )


    # ======================================
    # YAMNet ANALYSIS
    # ======================================

    try:

        yamnet_raw = detect_audio(
            str(filepath)
        )

    except Exception as e:

        print(
            f"YAMNet analysis failed: {e}"
        )

        yamnet_raw = []


    # ======================================
    # Convert YAMNet results
    # ======================================

    yamnet_predictions = []

    for item in yamnet_raw:

        if isinstance(item, dict):

            yamnet_predictions.append(
                Prediction(
                    label=str(
                        item.get(
                            "label",
                            item.get(
                                "species",
                                "Unknown"
                            )
                        )
                    ),

                    confidence=float(
                        item.get(
                            "confidence",
                            0
                        )
                    ),

                    scientific_name=str(
                        item.get(
                            "scientific_name",
                            ""
                        )
                    )
                )
            )


    # ======================================
    # BIRDNET ANALYSIS
    # ======================================

    try:

        birdnet_raw = detect_birds(
            str(filepath)
        )

    except Exception as e:

        print(
            f"BirdNET analysis failed: {e}"
        )

        birdnet_raw = []


    # ======================================
    # Convert BirdNET results
    # ======================================

    birdnet_predictions = []

    for item in birdnet_raw:

        if isinstance(item, dict):

            birdnet_predictions.append(
                BirdPrediction(

                    species=str(
                        item.get(
                            "species",
                            "Unknown"
                        )
                    ),

                    scientific_name=str(
                        item.get(
                            "scientific_name",
                            ""
                        )
                    ),

                    confidence=float(
                        item.get(
                            "confidence",
                            0
                        )
                    )
                )
            )


    # ======================================
    # SAVE TO MONGODB
    # ======================================

    uploaded_audio = AudioUpload(

        filename=audio.filename,

        filepath=str(filepath),

        uploaded_by=current_user.email,

        predictions=yamnet_predictions,

        bird_predictions=birdnet_predictions,

        analysis_status="Completed",
    )


    await uploaded_audio.insert()


    # ======================================
    # RETURN RESULTS
    # ======================================

    return {

        "message":
            "Audio uploaded and analyzed successfully",

        "audio_id":
            str(uploaded_audio.id),

        "filename":
            uploaded_audio.filename,

        "yamnet_predictions": [

            prediction.model_dump()

            for prediction
            in uploaded_audio.predictions

        ],

        "birdnet_predictions": [

            prediction.model_dump()

            for prediction
            in uploaded_audio.bird_predictions

        ],

        "analysis_status":
            uploaded_audio.analysis_status,
    }


# ==========================================
# GET ALL AUDIO FILES
# ==========================================

@router.get("/")
async def get_audios(
    current_user=Depends(
        get_current_user
    )
):

    return await AudioUpload.find_all().to_list()


# ==========================================
# GET AUDIO BY ID
# ==========================================

@router.get("/{audio_id}")
async def get_uploaded_audio(
    audio_id: str,
    current_user=Depends(
        get_current_user
    ),
):

    return await get_audio(
        audio_id
    )


# ==========================================
# DELETE AUDIO
# ==========================================

@router.delete(
    "/{audio_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_audio(
    audio_id: str,
    current_user=Depends(
        get_current_user
    ),
):

    audio = await get_audio(
        audio_id
    )

    await audio.delete()

    return None