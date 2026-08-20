from typing import Optional
from sqlalchemy.orm import Session
from app.models.audio_detection import AudioDetection
from app.models.image_detection import ImageDetection
from app.models.species_record import SpeciesRecord


class AIRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_image_detection(self, *, user_id: int, image_path: str, species: str, confidence: str, bounding_box: str, location: Optional[str] = None, scientific_name: Optional[str] = None, family: Optional[str] = None, genus: Optional[str] = None, habitat: Optional[str] = None, diet: Optional[str] = None, lifespan: Optional[str] = None, status: Optional[str] = None, annotated_image_path: Optional[str] = None, crop_image_path: Optional[str] = None, thumbnail_path: Optional[str] = None, detection_date: Optional[str] = None, detection_time: Optional[str] = None, inference_time: Optional[str] = None) -> ImageDetection:
        detection = ImageDetection(
            user_id=user_id,
            image_path=image_path,
            species=species,
            confidence=confidence,
            bounding_box=bounding_box,
            location=location,
            scientific_name=scientific_name,
            family=family,
            genus=genus,
            habitat=habitat,
            diet=diet,
            lifespan=lifespan,
            status=status,
            annotated_image_path=annotated_image_path,
            crop_image_path=crop_image_path,
            thumbnail_path=thumbnail_path,
            detection_date=detection_date,
            detection_time=detection_time,
            inference_time=inference_time,
        )
        self.db.add(detection)
        self.db.commit()
        self.db.refresh(detection)
        return detection

    def list_image_detections(self, user_id: int) -> list[ImageDetection]:
        return self.db.query(ImageDetection).filter(ImageDetection.user_id == user_id).order_by(ImageDetection.created_at.desc(), ImageDetection.id.desc()).all()

    def delete_image_detection(self, detection_id: int, user_id: int) -> bool:
        detection = self.db.query(ImageDetection).filter(ImageDetection.id == detection_id, ImageDetection.user_id == user_id).first()
        if not detection:
            return False
        self.db.delete(detection)
        self.db.commit()
        return True

    def create_audio_detection(self, *, user_id: int, audio_path: str, species: str, confidence: str, duration: str, frequency: str, scientific_name: Optional[str] = None, family: Optional[str] = None, genus: Optional[str] = None, habitat: Optional[str] = None, diet: Optional[str] = None, lifespan: Optional[str] = None, status: Optional[str] = None, waveform_path: Optional[str] = None, spectrogram_path: Optional[str] = None, thumbnail_path: Optional[str] = None, detection_date: Optional[str] = None, detection_time: Optional[str] = None, inference_time: Optional[str] = None, sample_rate: Optional[str] = None, dominant_frequency: Optional[str] = None, mfcc_mean: Optional[str] = None, spectral_centroid: Optional[str] = None, zero_crossing_rate: Optional[str] = None, location: Optional[str] = None) -> AudioDetection:
        detection = AudioDetection(
            user_id=user_id,
            audio_path=audio_path,
            species=species,
            confidence=confidence,
            duration=duration,
            frequency=frequency,
            scientific_name=scientific_name,
            family=family,
            genus=genus,
            habitat=habitat,
            diet=diet,
            lifespan=lifespan,
            status=status,
            waveform_path=waveform_path,
            spectrogram_path=spectrogram_path,
            thumbnail_path=thumbnail_path,
            detection_date=detection_date,
            detection_time=detection_time,
            inference_time=inference_time,
            sample_rate=sample_rate,
            dominant_frequency=dominant_frequency,
            mfcc_mean=mfcc_mean,
            spectral_centroid=spectral_centroid,
            zero_crossing_rate=zero_crossing_rate,
            location=location,
        )
        self.db.add(detection)
        self.db.commit()
        self.db.refresh(detection)
        return detection

    def list_audio_detections(self, user_id: int) -> list[AudioDetection]:
        return self.db.query(AudioDetection).filter(AudioDetection.user_id == user_id).order_by(AudioDetection.created_at.desc(), AudioDetection.id.desc()).all()

    def delete_audio_detection(self, detection_id: int, user_id: int) -> bool:
        detection = self.db.query(AudioDetection).filter(AudioDetection.id == detection_id, AudioDetection.user_id == user_id).first()
        if not detection:
            return False
        self.db.delete(detection)
        self.db.commit()
        return True

    def create_species_record(self, *, common_name: str, scientific_name: Optional[str], family: Optional[str], genus: Optional[str], habitat: Optional[str], status: Optional[str], confidence: float) -> SpeciesRecord:
        record = SpeciesRecord(
            common_name=common_name,
            scientific_name=scientific_name,
            family=family,
            genus=genus,
            habitat=habitat,
            status=status,
            confidence=confidence,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_species_record(self, record_id: int) -> Optional[SpeciesRecord]:
        return self.db.query(SpeciesRecord).filter(SpeciesRecord.id == record_id).first()

    def list_species_records(self) -> list[SpeciesRecord]:
        return self.db.query(SpeciesRecord).order_by(SpeciesRecord.created_at.desc()).all()
