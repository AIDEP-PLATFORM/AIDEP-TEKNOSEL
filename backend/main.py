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
from app.core.supabase_client import get_supabase

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
    supabase_status = "ok"

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

    try:
        sb = get_supabase()
        sb.table("_dummy_health_check_").select("*").limit(1).execute()
    except Exception as e:
        msg = str(e)
        # Bu hatalar Supabase'e bağlandık ama tablo yok demek — bağlantı OK
        ok_signals = ["404", "does not exist", "relation", "PGRST205", "schema cache", "APIError"]
        if any(signal in msg for signal in ok_signals):
            supabase_status = "ok"
        else:
            supabase_status = f"error: {msg}"

    return {
        "api": "ok",
        "db (supabase)": db_status,
        "redis": redis_status,
        "supabase_client": supabase_status,
    }

