import redis.asyncio as aioredis

from app.core.config import settings

# ---------------------------------------------------------------------------
# Redis Client — Singleton
# ---------------------------------------------------------------------------
# Uygulama boyunca tek bir connection pool kullanılır.
# Her request'te yeni bağlantı açmak yerine pool'dan alır.

_redis_client: aioredis.Redis | None = None


async def get_redis_client() -> aioredis.Redis:
    """
    Redis client'ı döner. İlk çağrıda oluşturur, sonrakilerde aynısını verir.

    Kullanım (FastAPI dependency):
        @router.get("/")
        async def my_route(redis: aioredis.Redis = Depends(get_redis_client)):
            await redis.set("key", "value")

    Kullanım (direkt):
        redis = await get_redis_client()
        await redis.ping()
    """
    global _redis_client

    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,  # bytes yerine string döner
            max_connections=20,
        )

    return _redis_client


async def close_redis_client() -> None:
    """Uygulama kapanırken bağlantıyı temizler (lifespan shutdown'da çağrılır)."""
    global _redis_client

    if _redis_client is not None:
        await _redis_client.aclose()
        _redis_client = None
