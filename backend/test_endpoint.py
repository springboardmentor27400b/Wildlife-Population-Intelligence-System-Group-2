import asyncio
from app.database.db import init_db
from app.services.biodiversity_analytics_service import BiodiversityAnalyticsService

async def main():
    await init_db()
    res = await BiodiversityAnalyticsService.get_summary_analytics()
    print("SUCCESS")

if __name__ == "__main__":
    asyncio.run(main())
