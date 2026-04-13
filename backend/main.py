import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import api_router
from app.api.routes import websocket as websocket_routes
from app.api.routes.websocket import eq_ws_manager
from app.core.config import settings
from app.core.db import async_engine
from app.core.redis import get_redis_client
from app.services.earthquake_fetcher import fetch_earthquakes

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Son yayınlanan depremin zamanı (in-memory; restart'ta sıfırlanır)
_last_eq_broadcast: datetime = datetime.now(timezone.utc)


async def _earthquake_polling_task():
    """
    Her 60 saniyede bir USGS/AFAD'dan yeni deprem kontrolü yapar.
    Yeni (M≥3.5) deprem bulunursa WebSocket ile bağlı tüm panellere bildirir.
    """
    global _last_eq_broadcast
    POLL_INTERVAL = 60  # saniye
    MIN_MAG_ALERT = 3.5  # bu büyüklükten küçükler broadcast edilmez

    while True:
        await asyncio.sleep(POLL_INTERVAL)
        try:
            items = await fetch_earthquakes(min_mag=MIN_MAG_ALERT, hours=1, limit=10)
            new_items = [
                eq for eq in items
                if eq.event_time > _last_eq_broadcast
            ]
            if new_items:
                _last_eq_broadcast = max(eq.event_time for eq in new_items)
                for eq in new_items:
                    await eq_ws_manager.broadcast({
                        "type": "new_earthquake",
                        "data": {
                            "id": eq.id,
                            "magnitude": eq.magnitude,
                            "depth_km": eq.depth_km,
                            "lat": eq.lat,
                            "lng": eq.lng,
                            "location_name": eq.location_name,
                            "event_time": eq.event_time.isoformat(),
                            "source": eq.source,
                            "url": eq.url,
                        },
                    })
                    logger.info(
                        "Deprem broadcast: M%.1f — %s",
                        eq.magnitude,
                        eq.location_name,
                    )
        except Exception as exc:
            logger.warning("Earthquake polling error: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Uygulama başlatılıyor...")
    task = asyncio.create_task(_earthquake_polling_task())
    yield
    task.cancel()
    logger.info("Uygulama kapatılıyor...")
    await async_engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(websocket_routes.router, prefix="/ws", tags=["websocket"])


@app.get("/health", tags=["health"])
async def health_check():
    db_status = "ok"
    redis_status = "ok"

    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    try:
        redis_client = await get_redis_client()
        await redis_client.ping()
    except Exception:
        redis_status = "error"

    return {
        "api": "ok",
        "db": db_status,
        "redis": redis_status,
    }
