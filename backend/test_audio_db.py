import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db import init_db
from app.models.audio_prediction import AudioPredictionRecord, TopPrediction
from datetime import datetime, timezone

async def test_audio_db():
    try:
        print("Initializing DB...")
        await init_db()
        print("DB initialized successfully.")
        
        record = AudioPredictionRecord(
            species_name="Test Bird",
            confidence_score=99.9,
            prediction_time=0.5,
            prediction_timestamp=datetime.now(timezone.utc),
            model_version="1.0.0 (Audio Test)",
            top_3_predictions=[TopPrediction(species="Test Bird", confidence=99.9)],
            top_predictions=[TopPrediction(species="Test Bird", confidence=99.9)],
            file_name="test.wav",
            file_url="/uploads/test.wav",
            duration_seconds=5.0,
            sample_rate=22050,
            channels=1,
            audio_quality="Good",
            noise_level_db=0.0,
            clipping_detected=False,
            silence_percentage=0.0,
            event_count=1,
            events=[],
            detection_source="Test",
            status="Pending",
            user_id="test_user",
            user_name="Test User"
        )
        
        print("Inserting record...")
        await record.insert()
        print(f"Record inserted successfully with ID: {record.id}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_audio_db())
