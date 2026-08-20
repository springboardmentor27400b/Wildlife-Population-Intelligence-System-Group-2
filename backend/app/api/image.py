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

from app.dependencies.auth import get_current_user
from app.models.image import ImageUpload
from app.models.wildlife import Wildlife
from app.ai.detector import detect_objects


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/images",
    tags=["Images"],
)


# ============================================================
# IMAGE UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = Path("uploads/images")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ============================================================
# CONSERVATION STATUS MAPPING
# ============================================================
#
# NOTE:
# YOLO detects the species.
# This mapping assigns a conservation status based on
# predefined project rules.
#
# You can change these values according to your project.
# ============================================================

CONSERVATION_STATUS = {

    "elephant": "Endangered",

    "lion": "Vulnerable",

    "tiger": "Endangered",

    "giraffe": "Vulnerable",

    "zebra": "Least Concern",

    "deer": "Least Concern",

    "bird": "Least Concern",

    "bear": "Vulnerable",

    "horse": "Least Concern",

    "cow": "Least Concern",

    "dog": "Least Concern",

    "cat": "Least Concern",

    "sheep": "Least Concern",

    "goat": "Least Concern",

    "monkey": "Least Concern",

}


# ============================================================
# GET IMAGE BY ID
# ============================================================

async def get_image(
    image_id: str
) -> ImageUpload:

    try:

        image = await ImageUpload.get(
            PydanticObjectId(image_id)
        )

    except Exception:

        image = None


    if not image:

        raise HTTPException(
            status_code=404,
            detail="Image not found."
        )


    return image


# ============================================================
# GET CONSERVATION STATUS
# ============================================================

def get_conservation_status(
    species: str
) -> str:

    species = species.lower().strip()

    return CONSERVATION_STATUS.get(
        species,
        "Not Classified"
    )


# ============================================================
# UPLOAD IMAGE + AI ANALYSIS
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
async def upload_image(

    image: UploadFile = File(...),

    current_user=Depends(
        get_current_user
    ),

):

    # ========================================================
    # 1. CHECK FILE
    # ========================================================

    if not image.filename:

        raise HTTPException(
            status_code=400,
            detail="Please select an image."
        )


    # ========================================================
    # 2. GENERATE UNIQUE FILE NAME
    # ========================================================

    extension = (

        Path(
            image.filename
        ).suffix.lower()

        or ".jpg"

    )


    unique_filename = (

        f"{uuid4()}"
        f"{extension}"

    )


    # ========================================================
    # 3. CREATE FILE PATH
    # ========================================================

    filepath = (

        UPLOAD_DIR
        /
        unique_filename

    )


    # ========================================================
    # 4. SAVE IMAGE
    # ========================================================

    with open(
        filepath,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            image.file,
            buffer
        )


    # ========================================================
    # 5. RUN YOLO AI DETECTION
    # ========================================================

    try:

        detections = detect_objects(
            str(filepath)
        )

    except Exception as e:

        print(
            f"YOLO detection failed: {e}"
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "AI image analysis failed: "
                f"{str(e)}"
            )

        )


    # ========================================================
    # 6. CALCULATE ANIMAL COUNT
    # ========================================================

    animal_count = len(
        detections
    )


    # ========================================================
    # 7. SAVE IMAGE ANALYSIS TO MONGODB
    # ========================================================

    uploaded_image = ImageUpload(

        filename=image.filename,

        filepath=(
            f"/uploads/images/"
            f"{unique_filename}"
        ),

        uploaded_by=current_user.email,

        detections=detections,

        animal_count=animal_count,

        analysis_status="Completed",

    )


    await uploaded_image.insert()


    # ========================================================
    # 8. AUTOMATICALLY CREATE WILDLIFE RECORDS
    # ========================================================

    wildlife_records = []


    for detection in detections:

        # ----------------------------------------------------
        # IMPORTANT:
        #
        # detect_objects() returns dictionaries.
        #
        # Example:
        #
        # {
        #     "species": "elephant",
        #     "confidence": 0.91,
        #     "behavior": "Walking",
        #     "behavior_confidence": 0.94
        # }
        #
        # Therefore use:
        #
        # detection["species"]
        #
        # NOT:
        #
        # detection.species
        # ----------------------------------------------------

        species = (

            detection
            .get(
                "species",
                "Unknown"
            )

        )


        confidence = (

            detection
            .get(
                "confidence",
                0
            )

        )


        behavior = (

            detection
            .get(
                "behavior",
                "Unknown"
            )

        )


        behavior_confidence = (

            detection
            .get(
                "behavior_confidence",
                0
            )

        )


        # ----------------------------------------------------
        # GET CONSERVATION STATUS
        # ----------------------------------------------------

        conservation_status = (

            get_conservation_status(
                species
            )

        )
        detection["conservation_status"] = conservation_status

        # ----------------------------------------------------
        # CREATE WILDLIFE RECORD
        # ----------------------------------------------------

        wildlife = Wildlife(
    species_name=species.title(),

    count=1,

    location="AI Image Detection",

    monitoring_site="AI Image Detection",

    health_status=conservation_status,

    conservation_status=conservation_status,

    behavior=behavior,

    behavior_confidence=behavior_confidence,

    detection_confidence=confidence,

    image_url=(
        f"/uploads/images/"
        f"{unique_filename}"
    ),
)


        await wildlife.insert()


        # ----------------------------------------------------
        # ADD COMPLETE WILDLIFE ANALYSIS
        # ----------------------------------------------------

        wildlife_records.append({

            "wildlife_id": str(
                wildlife.id
            ),

            "species": species.title(),

            "count": 1,

            "detection_confidence": confidence,

            "behavior": behavior,

            "behavior_confidence": (
                behavior_confidence
            ),

            "conservation_status": (
                conservation_status
            ),

            "image_url": (

                f"/uploads/images/"
                f"{unique_filename}"

            ),

        })


    # ========================================================
    # 9. RETURN COMPLETE AI ANALYSIS
    # ========================================================

    return {

        # ----------------------------------------------------
        # UPLOAD INFORMATION
        # ----------------------------------------------------

        "message": (
            "Image uploaded and "
            "analyzed successfully."
        ),

        "image_id": str(
            uploaded_image.id
        ),

        "filename": (
            uploaded_image.filename
        ),

        "image_url": (
            uploaded_image.filepath
        ),


        # ----------------------------------------------------
        # AI ANALYSIS SUMMARY
        # ----------------------------------------------------

        "analysis_status": (
            "Completed"
        ),

        "animal_count": (
            animal_count
        ),


        # ----------------------------------------------------
        # RAW YOLO + BEHAVIOR DETECTIONS
        # ----------------------------------------------------

        "detections": detections,


        # ----------------------------------------------------
        # AUTOMATIC WILDLIFE RECORDS
        # ----------------------------------------------------

        "wildlife_records": (
            wildlife_records
        ),

    }


# ============================================================
# GET ALL IMAGES
# ============================================================

@router.get("/")
async def get_images(

    current_user=Depends(
        get_current_user
    )

):

    return await (

        ImageUpload
        .find_all()
        .to_list()

    )


# ============================================================
# GET DETECTION HISTORY
# ============================================================

@router.get(
    "/history"
)
async def get_detection_history(

    current_user=Depends(
        get_current_user
    )

):

    history = (

        await ImageUpload
        .find_all()
        .sort(
            "-uploaded_at"
        )
        .to_list()

    )


    return history


# ============================================================
# GET SPECIES DETECTIONS
# ============================================================

@router.get(
    "/species/{species_name}"
)
async def get_species_detections(

    species_name: str,

    current_user=Depends(
        get_current_user
    ),

):

    images = (

        await ImageUpload
        .find_all()
        .to_list()

    )


    results = []


    for image in images:

        for detection in image.detections:

            # Handle both dictionary and object formats

            if isinstance(
                detection,
                dict
            ):

                detected_species = (

                    detection
                    .get(
                        "species",
                        ""
                    )

                )

                confidence = (

                    detection
                    .get(
                        "confidence",
                        0
                    )

                )

            else:

                detected_species = (

                    detection.species

                )

                confidence = (

                    detection.confidence

                )


            if (

                detected_species.lower()

                ==

                species_name.lower()

            ):

                results.append({

                    "filename": (
                        image.filename
                    ),

                    "uploaded_by": (
                        image.uploaded_by
                    ),

                    "uploaded_at": (
                        image.uploaded_at
                    ),

                    "confidence": (
                        confidence
                    ),

                    "species": (
                        detected_species
                    ),

                })


    return results


# ============================================================
# IMAGE STATISTICS
# ============================================================

@router.get(
    "/statistics"
)
async def image_statistics(

    current_user=Depends(
        get_current_user
    )

):

    images = (

        await ImageUpload
        .find_all()
        .to_list()

    )


    total_images = len(
        images
    )


    total_animals = 0


    species_count = {}


    for image in images:

        total_animals += (

            image.animal_count

        )


        for detection in image.detections:

            if isinstance(
                detection,
                dict
            ):

                species = (

                    detection
                    .get(
                        "species",
                        "Unknown"
                    )

                )

            else:

                species = (

                    detection.species

                )


            if species not in species_count:

                species_count[
                    species
                ] = 0


            species_count[
                species
            ] += 1


    return {

        "total_images": (
            total_images
        ),

        "total_animals_detected": (
            total_animals
        ),

        "species_statistics": (
            species_count
        ),

    }


# ============================================================
# GET IMAGE BY ID
# ============================================================

@router.get(
    "/{image_id}"
)
async def get_uploaded_image(

    image_id: str,

    current_user=Depends(
        get_current_user
    ),

):

    return await get_image(
        image_id
    )
