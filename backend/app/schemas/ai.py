from typing import Optional, Any
from pydantic import BaseModel, Field


class ImageUploadRequest(BaseModel):
    location: Optional[str] = Field(default=None)


class ImageDetectionOut(BaseModel):
    id: int
    image_path: str
    thumbnail: Optional[str] = None
    annotated_image_path: Optional[str] = None
    crop_image_path: Optional[str] = None
    annotated_image: Optional[str] = None
    crop_image: Optional[str] = None
    success: Optional[bool] = True
    original_image: Optional[str] = None
    detected_image: Optional[str] = None
    bounding_box_crop: Optional[str] = None
    bounding_boxes: Optional[list[dict]] = None
    species: Optional[str]
    scientific_name: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    habitat: Optional[str] = None
    diet: Optional[str] = None
    average_lifespan: Optional[str] = None
    status: Optional[str] = None
    iucn_status: Optional[str] = None
    confidence: Optional[str]
    bounding_box: Optional[Any] = None
    location: Optional[str]
    prediction_time: Optional[float] = None
    detection_date: Optional[str] = None
    detection_time: Optional[str] = None
    created_at: Optional[str]


class AudioUploadRequest(BaseModel):
    location: Optional[str] = Field(default=None)


class AudioDetectionOut(BaseModel):
    id: int
    audio_path: str
    thumbnail: Optional[str] = None
    waveform_image_path: Optional[str] = None
    spectrogram_image_path: Optional[str] = None
    species: Optional[str]
    scientific_name: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    habitat: Optional[str] = None
    diet: Optional[str] = None
    average_lifespan: Optional[str] = None
    status: Optional[str] = None
    iucn_status: Optional[str] = None
    gbif_link: Optional[str] = None
    confidence: Optional[str]
    duration: Optional[str]
    sample_rate: Optional[str] = None
    frequency: Optional[str] = None
    dominant_frequency: Optional[str] = None
    pitch: Optional[str] = None
    tempo: Optional[str] = None
    rms_energy: Optional[str] = None
    zero_crossing_rate: Optional[str] = None
    spectral_bandwidth: Optional[str] = None
    spectral_contrast: Optional[str] = None
    top5_predictions: Optional[list[dict]] = None
    features: Optional[dict] = None
    waveform_path: Optional[str] = None
    spectrogram_path: Optional[str] = None
    timestamp: Optional[str] = None
    prediction_time: Optional[float] = None
    location: Optional[str] = None
    detection_date: Optional[str] = None
    detection_time: Optional[str] = None
    created_at: Optional[str]


class SpeciesClassificationRequest(BaseModel):
    common_name: str
    scientific_name: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    habitat: Optional[str] = None
    status: Optional[str] = None
    confidence: float = 0.0


class SpeciesRecordOut(BaseModel):
    id: int
    common_name: str
    scientific_name: Optional[str]
    family: Optional[str]
    genus: Optional[str]
    habitat: Optional[str]
    status: Optional[str]
    confidence: Optional[float]


class BiodiversitySummary(BaseModel):
    total_species: int
    richness: int
    diversity_index: float
    most_common_species: Optional[str]
    rare_species: list[str]
    detection_trends: list[dict]
    average_confidence: float
    monthly_analytics: list[dict]
    species_distribution: list[dict]
    image_count: int
    audio_count: int
    recent_detections: list[dict]
    daily_trend: list[dict]
    monthly_trend: list[dict]
    confidence_distribution: list[dict]
    habitat_distribution: list[dict]
    conservation_status: list[dict]
    top_detected_species: list[dict]
    detection_timeline: list[dict]
    statistics: dict
    confidence_trend: Optional[list[dict]] = None
    daily_trends: Optional[list[dict]] = None
    monthly_trends: Optional[list[dict]] = None
