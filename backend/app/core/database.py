import time
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from pymongo import MongoClient
from app.core.config import settings

logger = logging.getLogger("database")

# PostgreSQL Configuration with pre-ping, recycling, and pooling for auto-reconnection resilience
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_size=10,
    max_overflow=20
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# MongoDB Configuration
mongo_client = MongoClient(settings.MONGO_URL)
mongo_db = mongo_client[settings.MONGO_DB_NAME]

def ensure_mongo_indexes() -> None:
    """
    Ensures background indexes on MongoDB collections for optimal analytics performance.
    """
    try:
        mongo_db["uploaded_media"].create_index([("uploaded_by", 1)], background=True)
        mongo_db["predictions"].create_index([("user_id", 1)], background=True)
        mongo_db["predictions"].create_index([("uploaded_media_id", 1)], background=True)
        logger.info("MongoDB analytics indexes verified.")
    except Exception as e:
        logger.warning(f"Could not verify MongoDB indexes: {e}")

def init_db_connection(max_retries: int = 2, retry_interval: float = 1.0) -> None:
    """
    Verifies PostgreSQL database connectivity on application startup.
    Retries with backoff if PostgreSQL is starting or temporarily unavailable.
    """
    logger.info("Verifying PostgreSQL database connection...")
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("Database connection established successfully.")
            ensure_mongo_indexes()
            return
        except Exception as e:
            if attempt < max_retries:
                logger.warning(
                    f"Waiting for PostgreSQL... Connection attempt {attempt}/{max_retries} failed: {e}. "
                    f"Retrying in {retry_interval}s..."
                )
                time.sleep(retry_interval)
            else:
                logger.warning(f"Database connection could not be established on startup: {e}. Server will continue running.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mongo_db():
    return mongo_db

