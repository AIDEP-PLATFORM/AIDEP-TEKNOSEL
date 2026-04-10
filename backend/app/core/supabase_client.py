# Bu dosya Supabase'in kendi Python kütüphanesine bağlantıyı yönetiyor.
from supabase import Client, create_client

from app.core.config import settings

_supabase_client: Client | None = None


def get_supabase() -> Client:
    global _supabase_client

    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "SUPABASE_URL ve SUPABASE_SERVICE_KEY .env dosyasında tanımlı olmalıdır."
            )
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY,
        )

    return _supabase_client
