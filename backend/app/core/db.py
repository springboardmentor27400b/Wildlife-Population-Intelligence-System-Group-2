from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from tortoise import Tortoise

from app.core.config import settings
from app.models.user import User
from app.models.monitoring import MonitoringSite
from app.models.wildlife import Wildlife
from app.models.image import ImageUpload
from app.models.audio import AudioUpload
from app.models.monitoring_site import MonitoringSite
from app.models.habitat import Habitat


async def init_db():
    print("=" * 60)
    print("POSTGRES DSN:", settings.POSTGRES_DSN)
    print("=" * 60)
    # PostgreSQL
    await Tortoise.init(
        db_url=settings.POSTGRES_DSN,
        modules={
            "models": ["app.models.user"]
        },
    )

    print("Loaded apps:", Tortoise.apps)

    await Tortoise.generate_schemas()
    print("=" * 60)
    print("MONGO URI:", settings.MONGO_URI)
    print("MONGO DB NAME:", settings.MONGO_DB_NAME)
    print("=" * 60) 
    # MongoDB
    client = AsyncIOMotorClient(settings.MONGO_URI)
    database = client[settings.MONGO_DB_NAME]

    await init_beanie(
    database=database,
    document_models=[
        MonitoringSite,
        Wildlife,
        ImageUpload,
        AudioUpload,
        Habitat
    ],
)


async def close_db():
    await Tortoise.close_connections()