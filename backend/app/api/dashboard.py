from fastapi import APIRouter

from app.models.user import User
from app.models.wildlife import Wildlife
from app.models.monitoring_site import MonitoringSite
from app.models.image import ImageUpload
from app.models.audio import AudioUpload


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
async def dashboard_summary():

    # ==========================================
    # BASIC COUNTS
    # ==========================================

    total_users = await User.all().count()

    total_sites = await MonitoringSite.find_all().count()

    total_wildlife = await Wildlife.find_all().count()


    # ==========================================
    # IMAGE ANALYTICS
    # ==========================================

    images = await ImageUpload.find_all().to_list()

    total_images = len(images)

    total_animals = 0

    species_statistics = {}

    behavior_statistics = {}

    recent_uploads = []


    for image in images:

        total_animals += image.animal_count

        for detection in image.detections:

            # Species statistics
            species = detection.species

            species_statistics[species] = (
                species_statistics.get(species, 0) + 1
            )

            # Behavior statistics
            behavior = detection.behavior

            if behavior and behavior != "Unknown":

                behavior_statistics[behavior] = (
                    behavior_statistics.get(behavior, 0) + 1
                )


        # Recent image uploads
        recent_uploads.append({
            "filename": image.filename,
            "animal_count": image.animal_count,
            "analysis_status": image.analysis_status,
            "uploaded_at": image.uploaded_at,
        })


    # Sort recent image uploads
    recent_uploads = sorted(
        recent_uploads,
        key=lambda x: x["uploaded_at"],
        reverse=True
    )[:5]


    # ==========================================
    # AUDIO ANALYTICS
    # ==========================================

    audio_files = await AudioUpload.find_all().to_list()

    total_audio_files = len(audio_files)

    audio_statistics = {}

    birdnet_statistics = {}

    recent_audio_uploads = []


    for audio in audio_files:

        # --------------------------------------
        # YAMNet statistics
        # --------------------------------------

        for prediction in audio.predictions:

            label = prediction.label

            audio_statistics[label] = (
                audio_statistics.get(label, 0) + 1
            )


        # --------------------------------------
        # BirdNET statistics
        # --------------------------------------

        for prediction in audio.bird_predictions:

            species = prediction.species

            birdnet_statistics[species] = (
                birdnet_statistics.get(species, 0) + 1
            )


        # Recent audio uploads
        recent_audio_uploads.append({
            "filename": audio.filename,
            "analysis_status": audio.analysis_status,
            "uploaded_at": audio.uploaded_at,
        })


    # Sort recent audio uploads
    recent_audio_uploads = sorted(
        recent_audio_uploads,
        key=lambda x: x["uploaded_at"],
        reverse=True
    )[:5]


    # ==========================================
    # FINAL RESPONSE
    # ==========================================

    return {

        # Basic statistics
        "total_users": total_users,

        "total_monitoring_sites": total_sites,

        "total_wildlife_records": total_wildlife,


        # Image statistics
        "total_images": total_images,

        "total_animals_detected": total_animals,


        # Audio statistics
        "total_audio_files": total_audio_files,


        # AI analytics
        "species_statistics": species_statistics,

        "behavior_statistics": behavior_statistics,

        "audio_statistics": audio_statistics,

        "birdnet_statistics": birdnet_statistics,


        # Recent activity
        "recent_image_uploads": recent_uploads,

        "recent_audio_uploads": recent_audio_uploads,
    }