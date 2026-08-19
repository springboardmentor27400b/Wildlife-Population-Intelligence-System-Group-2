import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    MONGO_URL: str
    MONGO_DB_NAME: str = "wildlife_db"
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ROBOFLOW_API_KEY: str = ""
    IUCN_API_KEY: str = ""
    NEWSDATA_API_KEY: str = ""

    # Google Cloud Storage Model Sync Configuration
    GCS_MODEL_BUCKET: str = ""
    GCS_MODEL_PREFIX: str = ""
    LOCAL_MODEL_CACHE_DIR: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        extra = "ignore"

settings = Settings()
