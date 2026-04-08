from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="AIDEP API",
    version="1.0.0",
    description="AI Destekli Deprem Afet Yönetim Platformu | Teknosel 2026 OÜ2662",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.environment == "development" else [],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)
# TODO: router'ları ekle — Issue BE1-001
@app.get("/api/v1/health", tags=["health"])
async def health():
    return {"status": "ok", "version": "1.0.0"}
