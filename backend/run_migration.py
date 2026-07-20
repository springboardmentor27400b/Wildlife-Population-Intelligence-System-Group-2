import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.database.db import init_db

async def run():
    print("Running migration...")
    await init_db()
    print("Migration finished.")

if __name__ == "__main__":
    asyncio.run(run())
