import os
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.core.database import get_db, get_mongo_db
from app.api.deps import get_current_user, RoleChecker
from app.models.sql import Observation, Survey, MonitoringSite, Device, User
from app.models.schemas import ObservationCreate, ObservationResponse
from app.models.nosql import UploadedMedia
import hashlib
import gridfs

router = APIRouter()

@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_media(
    files: List[UploadFile] = File(...),
    survey_id: Optional[int] = Form(None),
    site_id: Optional[int] = Form(None),
    device_id: Optional[int] = Form(None),
    current_user: User = Depends(RoleChecker(["Researcher", "Officer", "ForestDept"])),
    mongo_db = Depends(get_mongo_db)
):
    saved_paths = []
    fs = gridfs.GridFS(mongo_db)
    
    for file in files:
        # Create a unique filename
        filename = f"{current_user.id}_{uuid.uuid4().hex}_{file.filename}"
        
        try:
            # Read bytes of file to get file size, hash, and save to GridFS
            import hashlib
            file_bytes = file.file.read()
            file_size = len(file_bytes)
            file_hash = hashlib.sha256(file_bytes).hexdigest()
            
            # Put the file directly into MongoDB Atlas GridFS
            gridfs_file_id = fs.put(
                file_bytes,
                filename=filename,
                content_type=file.content_type or "application/octet-stream"
            )
            
            # Return relative path for database storage (backward compatible)
            saved_path = f"/media/{filename}"
            saved_paths.append(saved_path)
            
            # Determine file_type (image/audio)
            file_type = "image"
            if file.content_type:
                if file.content_type.startswith("audio/"):
                    file_type = "audio"
                elif not file.content_type.startswith("image/"):
                    ext = file.filename.split('.')[-1].lower()
                    if ext in ['wav', 'mp3']:
                        file_type = "audio"
            else:
                ext = file.filename.split('.')[-1].lower()
                if ext in ['wav', 'mp3']:
                    file_type = "audio"
            
            # Create UploadedMedia model instance
            media_metadata = UploadedMedia(
                filename=filename,
                original_filename=file.filename,
                file_type=file_type,
                mime_type=file.content_type or "application/octet-stream",
                file_size=file_size,
                storage_path=saved_path,
                uploaded_by=current_user.id,
                survey_id=None,
                site_id=None,
                device_id=None,
                upload_status="uploaded",
                gridfs_id=str(gridfs_file_id),
                sha256_hash=file_hash
            )
            
            # Convert to dict and insert to MongoDB Atlas
            media_dict = media_metadata.model_dump(by_alias=True)
            if "_id" in media_dict and media_dict["_id"] is None:
                del media_dict["_id"]
                
            mongo_db["uploaded_media"].insert_one(media_dict)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file {file.filename}: {e}"
            )
            
    return {"urls": saved_paths}

@router.post("/", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def create_observation(
    obs_in: ObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Researcher", "Admin"])),
    mongo_db = Depends(get_mongo_db)
):
    # Verify survey exists
    survey = db.query(Survey).filter(Survey.id == obs_in.survey_id).first()
    if not survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
        
    # Verify site exists
    site = db.query(MonitoringSite).filter(MonitoringSite.id == obs_in.site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring site not found")
        
    # Verify device exists if provided
    if obs_in.device_id is not None:
        device = db.query(Device).filter(Device.id == obs_in.device_id).first()
        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
            
    db_obs = Observation(
        survey_id=obs_in.survey_id,
        site_id=obs_in.site_id,
        researcher_id=current_user.id,
        device_id=obs_in.device_id,
        uploaded_images=obs_in.uploaded_images,
        uploaded_audio=obs_in.uploaded_audio,
        observation_notes=obs_in.observation_notes
    )
    db.add(db_obs)
    db.commit()
    db.refresh(db_obs)
    
    # Associate uploaded media metadata with this observation's survey, site, and device
    all_media_paths = (obs_in.uploaded_images or []) + (obs_in.uploaded_audio or [])
    if all_media_paths:
        try:
            mongo_db["uploaded_media"].update_many(
                {"storage_path": {"$in": all_media_paths}},
                {
                    "$set": {
                        "survey_id": obs_in.survey_id,
                        "site_id": obs_in.site_id,
                        "device_id": obs_in.device_id,
                        "observation_id": db_obs.id,
                        "uploaded_by": current_user.id,
                        "upload_status": "associated"
                    }
                }
            )
        except Exception as e:
            print(f"Error updating uploaded_media association in MongoDB: {e}")
            
    return db_obs

@router.get("/", response_model=list[ObservationResponse])
def list_observations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Observation).all()

@router.get("/media", response_model=dict)
def list_uploaded_media(
    file_type: Optional[str] = Query(None, description="Optional filter by file_type e.g. image or audio"),
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    """
    Returns paginated uploaded media records strictly belonging to the authenticated user.
    Can be optionally filtered by file_type ('image' or 'audio').
    """
    query = {"uploaded_by": current_user.id}
    if file_type:
        query["file_type"] = file_type.lower()

    total_count = mongo_db["uploaded_media"].count_documents(query)
    
    docs = list(
        mongo_db["uploaded_media"]
        .find(query)
        .sort("_id", -1)
        .skip(skip)
        .limit(limit)
    )
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        
    has_more = (skip + len(docs)) < total_count
    return {
        "items": docs,
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "has_more": has_more
    }

@router.get("/{observation_id}", response_model=ObservationResponse)
def get_observation(
    observation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    obs = db.query(Observation).filter(Observation.id == observation_id).first()
    if not obs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation not found")
    return obs

@router.get("/survey/{survey_id}/history", response_model=list[ObservationResponse])
def get_survey_history(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify survey exists
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
        
    return db.query(Observation).filter(Observation.survey_id == survey_id).all()

@router.get("/media/{filename}")
def get_media_file(
    filename: str,
    mongo_db = Depends(get_mongo_db)
):
    from fastapi.responses import StreamingResponse, FileResponse
    import gridfs
    from bson.objectid import ObjectId

    fs = gridfs.GridFS(mongo_db)
    clean_fn = filename.split("/")[-1]

    # 1. Attempt direct GridFS lookup by filename
    grid_out = fs.find_one({"filename": clean_fn})

    # 2. Lookup uploaded_media document in MongoDB to find gridfs_id or storage filename
    if not grid_out:
        doc = mongo_db["uploaded_media"].find_one({
            "$or": [
                {"filename": clean_fn},
                {"original_filename": clean_fn},
                {"storage_path": clean_fn},
                {"storage_path": f"/media/{clean_fn}"}
            ]
        })
        if doc:
            if doc.get("gridfs_id"):
                try:
                    grid_out = fs.get(ObjectId(doc["gridfs_id"]))
                except Exception:
                    pass
            if not grid_out and doc.get("filename"):
                grid_out = fs.find_one({"filename": doc["filename"]})

    if grid_out:
        return StreamingResponse(grid_out, media_type=grid_out.content_type or "image/jpeg")

    # 3. Fallback to local disk file in backend/app/media/
    STORAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "media")
    local_path = os.path.join(STORAGE_DIR, clean_fn)
    if os.path.exists(local_path):
        return FileResponse(local_path)

    # 4. If clean_fn contains hash prefix, check matching local file
    if "_" in clean_fn:
        parts = clean_fn.split("_", 2)
        target_name = parts[-1]
        for f in os.listdir(STORAGE_DIR):
            if f == target_name or f.endswith(target_name):
                return FileResponse(os.path.join(STORAGE_DIR, f))

    # 5. GridFS fallback to latest uploaded image file if requested seed image is missing
    latest_img = mongo_db["fs.files"].find_one(
        {"filename": {"$regex": r"\.(jpg|jpeg|png|webp|bmp)$", "$options": "i"}},
        sort=[("uploadDate", -1)]
    ) or mongo_db["fs.files"].find_one({}, sort=[("uploadDate", -1)])
    
    if latest_img:
        try:
            grid_out = fs.get(latest_img["_id"])
            if grid_out:
                return StreamingResponse(grid_out, media_type=grid_out.content_type or "image/jpeg")
        except Exception:
            pass

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"File not found: {filename}")

@router.delete("/media/{filename}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media_file(
    filename: str,
    current_user: User = Depends(RoleChecker(["Admin"])),
    mongo_db = Depends(get_mongo_db)
):
    import gridfs
    from bson.objectid import ObjectId
    fs = gridfs.GridFS(mongo_db)
    
    doc = mongo_db["uploaded_media"].find_one({"filename": filename})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media record not found"
        )
        
    gridfs_id_str = doc.get("gridfs_id")
    if gridfs_id_str:
        try:
            fs.delete(ObjectId(gridfs_id_str))
        except Exception as e:
            print(f"Error deleting GridFS file: {e}")
            
    mongo_db["uploaded_media"].delete_one({"filename": filename})
