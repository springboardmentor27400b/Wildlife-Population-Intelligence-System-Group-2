import os
import time
import uuid
import urllib.request
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging_config import logger
from app.models.media import Media
from app.models.observation import Observation
from app.ai.audio.preprocess import preprocess_audio
from app.ai.audio.inference import AudioClassifier
from app.ai.audio.taxonomy import taxonomy_resolver

class AudioAIService:
    def __init__(self):
        self.classifier = AudioClassifier()

    def analyze_audio(self, db: Session, observation: Observation, media_file: Media) -> Dict[str, Any]:
        """
        Runs Mel Spectrogram preprocessing and PyTorch prediction on the audio file.
        Returns strict contract JSON.
        """
        start_time = time.time()
        file_url = media_file.file_url
        is_temp_file = False
        
        # 1. Download or resolve file path
        if file_url.startswith("http://") or file_url.startswith("https://"):
            temp_dir = Path(settings.UPLOAD_DIR) / "temp"
            temp_dir.mkdir(parents=True, exist_ok=True)
            temp_filename = f"temp_{uuid.uuid4().hex}_{file_url.split('/')[-1]}"
            local_path = temp_dir / temp_filename
            try:
                req = urllib.request.Request(
                    file_url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                )
                with urllib.request.urlopen(req) as response, open(local_path, 'wb') as out_file:
                    out_file.write(response.read())
                is_temp_file = True
            except Exception as e:
                logger.error(f"Failed to download remote audio from URL: {e}")
                raise FileNotFoundError(f"Remote source audio could not be fetched: {file_url}")
        else:
            if file_url.startswith("/static/uploads/"):
                rel_path = file_url.replace("/static/uploads/", "", 1)
                local_path = Path(settings.UPLOAD_DIR) / rel_path
            elif file_url.startswith("/static/"):
                base_dir = Path(settings.UPLOAD_DIR).parent
                local_path = base_dir / file_url.lstrip("/")
            else:
                local_path = Path(file_url)
                
            if not local_path.exists():
                raise FileNotFoundError(f"Source media file not found: {local_path}")

        try:
            # 2. Run spectrogram preprocessing
            spectrogram_tensor = preprocess_audio(str(local_path))
            
            # 3. Model prediction
            predictions = self.classifier.predict(spectrogram_tensor)
            
            # 4. Resolve taxonomy for predictions
            top5_payload = []
            for rank_idx, pred in enumerate(predictions):
                label = pred["label"]
                conf = pred["confidence"]
                
                tax = taxonomy_resolver.resolve(label)
                top5_payload.append({
                    "rank": rank_idx + 1,
                    "primary_label": label,
                    "common_name": tax["common_name"],
                    "scientific_name": tax["scientific_name"],
                    "class": tax["class_name"],
                    "confidence": round(conf * 100, 2)
                })
                
            top_prediction = top5_payload[0] if top5_payload else {
                "primary_label": "Unknown",
                "common_name": "Unknown",
                "scientific_name": "Unknown",
                "class": "Unknown",
                "confidence": 0.0
            }
            
            processing_time = round(time.time() - start_time, 2)
            
            return {
                "success": True,
                "module": "audio",
                "model": "EfficientNet-B0",
                "processing_time": processing_time,
                "observation_id": str(observation.id),
                "top_prediction": top_prediction,
                "top5_predictions": top5_payload
            }

        finally:
            # Clean up temp file
            if is_temp_file and local_path.exists():
                try:
                    os.remove(local_path)
                except Exception as e:
                    logger.error(f"Failed to clean up temp file: {e}")

audio_ai_service = AudioAIService()
