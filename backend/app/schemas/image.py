from pydantic import BaseModel


class ImageUploadResponse(BaseModel):
    message: str
    image_id: str
    filename: str
    status: str
    analysis_status: str