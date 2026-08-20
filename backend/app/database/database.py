import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# Reads DATABASE_URL from environment with fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wildlife.db")

# Fix legacy heroku/postgres:// URLs if present
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure database engine arguments based on dialect
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    logger.info("Database engine initialized with SQLite driver (%s)", DATABASE_URL)
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30
    )
    logger.info("Database engine initialized with PostgreSQL driver (%s)", DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "production")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
