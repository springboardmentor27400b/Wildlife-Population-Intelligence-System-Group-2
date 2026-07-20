import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    client = AsyncIOMotorClient('mongodb://localhost:27017/wildlife_db')
    db = client['wildlife_db']
    users = await db.User.find().to_list(10)
    for u in users:
        print(f"User ID: {u['_id']}, Email: {u.get('email')}")
    await client.close()

if __name__ == "__main__":
    asyncio.run(run())
