from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db, get_mongo_db
from app.api.deps import get_current_user
from app.models.sql import User, Survey, Device

router = APIRouter()

@router.get("/stats")
def get_user_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    """
    Returns aggregated dashboard statistics:
    1. Total Species Detections / Uploaded Images
    2. Active Surveys Running (System-wide active surveys)
    3. Recent Active Alerts / Offline Devices
    """
    user_id = current_user.id
    user_role = str(getattr(current_user.role, "value", current_user.role))

    # Active Surveys Running: System-wide active surveys
    active_surveys_count = db.query(func.count(Survey.id)).filter(
        func.lower(Survey.status) == "active"
    ).scalar() or 0

    if user_role in ["Admin", "ForestDept", "Officer"]:
        unique_image_count = mongo_db["uploaded_media"].count_documents({"file_type": "image"}) or mongo_db["uploaded_media"].count_documents({})
        offline_devices_count = db.query(func.count(Device.id)).filter(
            func.upper(Device.status).in_(["OFFLINE", "MAINTENANCE"])
        ).scalar() or 0
    else:
        pipeline = [
            {"$match": {"uploaded_by": user_id, "file_type": "image"}},
            {
                "$project": {
                    "unique_key": {
                        "$cond": [
                            {"$ifNull": ["$sha256_hash", False]},
                            "$sha256_hash",
                            {"$concat": ["$original_filename", "_", {"$toString": "$file_size"}]}
                        ]
                    }
                }
            },
            {"$group": {"_id": "$unique_key"}},
            {"$count": "total_unique"}
        ]
        mongo_res = list(mongo_db["uploaded_media"].aggregate(pipeline))
        unique_image_count = mongo_res[0]["total_unique"] if mongo_res else mongo_db["uploaded_media"].count_documents({})

        offline_devices_count = db.query(func.count(Device.id)).filter(
            Device.created_by == user_id,
            func.upper(Device.status).in_(["OFFLINE", "MAINTENANCE"])
        ).scalar() or 0

    return {
        "user_id": user_id,
        "user_name": current_user.full_name,
        "total_species_detections": unique_image_count,
        "active_surveys": active_surveys_count,
        "recent_active_alerts": offline_devices_count
    }
