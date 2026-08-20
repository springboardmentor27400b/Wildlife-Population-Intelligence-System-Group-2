from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    POSTGRES_DSN: str
    MONGO_URI: str
    MONGO_DB_NAME: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str= "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()