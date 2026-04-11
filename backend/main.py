import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import api_router
from app.api.routes import websocket as websocket_routes
from app.core.config import settings
from app.core.db import async_engine
from app.core.redis import get_redis_client

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Uygulama başlatılıyor...")
    yield
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
