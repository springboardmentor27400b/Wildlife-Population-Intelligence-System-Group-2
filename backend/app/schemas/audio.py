from pydantic import BaseModel


class AudioResponse(BaseModel):
    filename: str
    prediction: str
    confidence: float
    analysis_status: str