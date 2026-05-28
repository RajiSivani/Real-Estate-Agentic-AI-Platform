"""
Supabase database client initialization
"""
from supabase import create_client, Client
from app.config import settings


class SupabaseClient:
    """Singleton Supabase client"""
    
    _instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client instance"""
        if cls._instance is None:
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
        return cls._instance


# Convenience function to get client
def get_db() -> Client:
    """Get Supabase client instance"""
    return SupabaseClient.get_client()
