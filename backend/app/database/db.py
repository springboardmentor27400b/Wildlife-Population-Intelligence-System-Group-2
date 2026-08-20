from supabase import create_client, Client
from app.core.config import settings
from app.utils.logger import logger

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)

async def init_db():
    """
    Initialize the database connection.
    In Supabase, the client is synchronous and initialized above.
    We just perform a quick connection check here.
    """
    try:
        # Perform a lightweight query to verify connection
        response = supabase.table("roles").select("id").limit(1).execute()
        logger.info("Successfully connected to Supabase PostgreSQL database.")
    except Exception as e:
        logger.error(f"Failed to connect to Supabase: {str(e)}")
        raise e
