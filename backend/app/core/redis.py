import redis.asyncio as aioredis

from app.core.config import settings


_redis_client: aioredis.Redis | None = None


async def get_redis_client() -> aioredis.Redis:
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
    global _redis_client

    if _redis_client is not None:
        await _redis_client.aclose()
        _redis_client = None
