import asyncio
import io
import os
from fastapi import UploadFile, Request
from app.services.audio_prediction_service import AudioPredictionService
from app.models.user import User
from app.database.db import init_db

async def main():
    await init_db()
    with open("dummy_valid.wav", "rb") as f:
        file_bytes = f.read()

    class MockFile:
        filename = "dummy_valid.wav"
        async def read(self):
            return file_bytes

    class MockRequest:
        state = type("State", (), {})()
        client = type("Client", (), {"host": "127.0.0.1"})()

    user = User(
        email="test@example.com",
        password_hash="...",
        full_name="Test User",
        role="Researcher"
    )

    try:
        res = await AudioPredictionService.process_and_predict(
            file=MockFile(),
            current_user=user,
            request=MockRequest()
        )
        print("SUCCESS:", res)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(main())
