import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
dotenv_path = BASE_DIR / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "Wildlife Population Intelligence System"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "wildlife_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    @property
    def DATABASE_URL(self) -> str:
        # Check if DATABASE_URL is defined directly (e.g. Docker Compose)
        url = os.getenv("DATABASE_URL")
        if url:
            return url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretjwtkeyforwildlifepopulationintelligence2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    
    # Storage settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760")) # 10MB default
    ALLOWED_IMAGE_EXTENSIONS: list = os.getenv("ALLOWED_IMAGE_EXTENSIONS", "jpg,jpeg,png,webp").split(",")
    ALLOWED_AUDIO_EXTENSIONS: list = os.getenv("ALLOWED_AUDIO_EXTENSIONS", "mp3,wav,ogg,m4a").split(",")
    
    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    @property
    def is_cloudinary_configured(self) -> bool:
        return bool(self.CLOUDINARY_CLOUD_NAME and self.CLOUDINARY_API_KEY and self.CLOUDINARY_API_SECRET)

settings = Settings()
