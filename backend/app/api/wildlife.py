from pathlib import Path
from uuid import uuid4

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.dependencies.auth import get_current_user
from app.models.wildlife import Wildlife
from app.schemas.wildlife import WildlifeCreate

router = APIRouter(prefix="/wildlife", tags=["Wildlife"])
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

async def get_animal(wildlife_id: str) -> Wildlife:
    try:
        animal = await Wildlife.get(PydanticObjectId(wildlife_id))
    except Exception:
        animal = None
    if not animal:
        raise HTTPException(status_code=404, detail="Wildlife record not found.")
    return animal

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_wildlife(wildlife: WildlifeCreate, current_user=Depends(get_current_user)):
    wildlife_data = wildlife.dict()

    # Normalize species name
    wildlife_data["species_name"] = (
        wildlife_data["species_name"]
        .strip()
        .title()
    )

    animal = Wildlife(**wildlife_data)
    await animal.insert()
    return animal

@router.get("/")
async def get_wildlife(current_user=Depends(get_current_user)):
    return await Wildlife.find_all().to_list()

@router.put("/{wildlife_id}")
async def update_wildlife(wildlife_id: str, wildlife: WildlifeCreate, current_user=Depends(get_current_user)):
    animal = await get_animal(wildlife_id)
    for field, value in wildlife.dict().items():
        setattr(animal, field, value)
    await animal.save()
    return animal

@router.delete("/{wildlife_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wildlife(wildlife_id: str, current_user=Depends(get_current_user)):
    animal = await get_animal(wildlife_id)
    await animal.delete()

@router.post("/{wildlife_id}/image")
async def upload_wildlife_image(wildlife_id: str, image: UploadFile = File(...), current_user=Depends(get_current_user)):
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Upload a JPG, PNG, or WebP image.")
    animal = await get_animal(wildlife_id)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(image.filename or "image.jpg").suffix.lower() or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    content = await image.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller.")
    (UPLOAD_DIR / filename).write_bytes(content)
    animal.image_url = f"/uploads/{filename}"
    await animal.save()
    return animal
@router.get("/report")
async def get_wildlife_report(
    current_user=Depends(get_current_user)
):
    wildlife_records = await Wildlife.find_all().to_list()

    total_animals = sum(
        record.count for record in wildlife_records
    )

    species_summary = {}

    for record in wildlife_records:
        species = record.species_name

        if species not in species_summary:
            species_summary[species] = 0

        species_summary[species] += record.count

    return {
        "report_title": "Wildlife Population Intelligence Report",
        "total_records": len(wildlife_records),
        "total_animals": total_animals,
        "species_summary": species_summary,
        "wildlife": [
            {
                "id": str(record.id),
                "species_name": record.species_name,
                "count": record.count,
                "location": record.location,
                "health_status": record.health_status,
                "conservation_status": record.conservation_status,
                "behavior": record.behavior,
                "behavior_confidence": record.behavior_confidence,
                "detection_confidence": record.detection_confidence,
                "image_url": record.image_url,
            }
            for record in wildlife_records
        ],
    }
