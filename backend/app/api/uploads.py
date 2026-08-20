from app.database.adapter import find_one, find_all, insert, save, delete, get, count_documents
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from typing import List, Optional

from datetime import datetime, timezone

from app.models.upload import FieldUpload
from app.schemas.upload import FieldUploadResponse, FieldUploadUpdate
from app.api.auth import get_current_user
from app.models.user import User
from app.models.site import MonitoringSite

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "jpg", "jpeg", "png", "webp",  # Images
    "mp4", "mov", "avi",           # Videos
    "mp3", "wav",                  # Audio
    "pdf", "csv", "xlsx", "docx"   # Documents
}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

def check_permission(upload: FieldUpload, current_user: User):
    if upload.uploaded_by == str(current_user.id):
        return
    role_name = current_user.role.name.lower() if hasattr(current_user.role, 'name') else str(current_user.role).lower()
    if role_name != "administrator":
        raise HTTPException(status_code=403, detail="You do not have permission to modify this upload.")

def validate_and_save_file(file: UploadFile) -> tuple[str, str, str, float]:
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload an allowed image, video, audio, or document file.")
    
    file_bytes = file.file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size must not exceed 20 MB.")
        
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)
        
    file_url = f"http://127.0.0.1:8000/uploads/{unique_filename}"
    return unique_filename, file_url, file.content_type, file_size_mb

@router.post("/", response_model=FieldUploadResponse, status_code=status.HTTP_201_CREATED)
async def create_upload(
    title: str = Form(...),
    upload_type: str = Form(...),
    monitoring_site_id: str = Form(...),
    sensor_device_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        site = await get(MonitoringSite, str(monitoring_site_id))
        if not site:
            raise HTTPException(status_code=404, detail="Monitoring site not found.")
    except Exception:
        raise HTTPException(status_code=404, detail="Monitoring site not found.")

    unique_filename, file_url, mime_type, file_size_mb = validate_and_save_file(file)

    # Note: frontend can send "undefined" or "null" string from FormData
    if sensor_device_id in ["undefined", "null", ""]:
        sensor_device_id = None

    new_upload = FieldUpload(
        title=title,
        upload_type=upload_type,
        file_name=file.filename,
        stored_file_name=unique_filename,
        file_url=file_url,
        file_size=file_size_mb,
        mime_type=mime_type,
        monitoring_site_id=monitoring_site_id,
        monitoring_site_name=site.site_name,
        sensor_device_id=sensor_device_id,
        sensor_device_name="", # Optionally resolve sensor device name here
        description=description if description not in ["undefined", "null", ""] else None,
        status="Pending Review",
        uploaded_by=str(current_user.id),
        uploaded_by_name=current_user.full_name
    )
    
    if sensor_device_id:
        from app.models.device import SensorDevice
        try:
            device = await get(SensorDevice, str(sensor_device_id))
            if device:
                new_upload.sensor_device_name = device.device_name
        except:
            pass

    await insert(new_upload)
    return new_upload

@router.get("/", response_model=List[FieldUploadResponse])
async def get_uploads(current_user: User = Depends(get_current_user)):
    from app.database.db import supabase
    res = supabase.table("field_uploads").select("*").order("uploaded_at", desc=True).execute()
    uploads = [FieldUpload(**d) for d in res.data]
    return uploads

@router.get("/{upload_id}", response_model=FieldUploadResponse)
async def get_upload(upload_id: str, current_user: User = Depends(get_current_user)):
    upload = await get(FieldUpload, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return upload

@router.put("/{upload_id}", response_model=FieldUploadResponse)
async def update_upload(upload_id: str, request: Request, current_user: User = Depends(get_current_user)):
    upload = await get(FieldUpload, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
        
    check_permission(upload, current_user)
    
    content_type = request.headers.get("content-type", "")
    
    if "multipart/form-data" in content_type:
        form = await request.form()
        
        # update metadata
        if "title" in form: upload.title = form["title"]
        if "upload_type" in form: upload.upload_type = form["upload_type"]
        if "description" in form: upload.description = form["description"] if form["description"] not in ["undefined", "null"] else None
        if "status" in form: upload.status = form["status"]
        if "monitoring_site_id" in form: 
            upload.monitoring_site_id = form["monitoring_site_id"]
            site = await get(MonitoringSite, str(upload.monitoring_site_id))
            if site: upload.monitoring_site_name = site.site_name
        if "sensor_device_id" in form: 
            upload.sensor_device_id = form["sensor_device_id"] if form["sensor_device_id"] not in ["undefined", "null", ""] else None
            if upload.sensor_device_id:
                from app.models.device import SensorDevice
                device = await get(SensorDevice, str(upload.sensor_device_id))
                if device: upload.sensor_device_name = device.device_name
            else:
                upload.sensor_device_name = None
        
        # replace file if provided
        file = form.get("file")
        if file and isinstance(file, UploadFile) and file.filename:
            old_file_path = os.path.join(UPLOAD_DIR, upload.file_url.split("/")[-1])
            
            unique_filename, file_url, mime_type, file_size_mb = validate_and_save_file(file)
            
            upload.file_name = file.filename
            upload.stored_file_name = unique_filename
            upload.file_url = file_url
            upload.mime_type = mime_type
            upload.file_size = file_size_mb
            
            # remove old file securely
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except:
                    pass
    else:
        # JSON metadata update
        json_data = await request.json()
        update_schema = FieldUploadUpdate(**json_data)
        update_dict = update_schema.model_dump(exclude_unset=True)
        for k, v in update_dict.items():
            setattr(upload, k, v)
            
    upload.updated_at = datetime.now(timezone.utc)
    await save(upload)
    return upload

@router.delete("/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_upload(upload_id: str, current_user: User = Depends(get_current_user)):
    upload = await get(FieldUpload, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
        
    check_permission(upload, current_user)
    
    file_path = os.path.join(UPLOAD_DIR, upload.file_url.split("/")[-1])
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except:
            pass
            
    await delete(upload)
