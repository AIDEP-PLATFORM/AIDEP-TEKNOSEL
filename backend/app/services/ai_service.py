"""
AI Servisi HTTP İstemcisi
===========================
ai-service container'ına HTTP istek atar.

POST /detect      → YOLOv8m hasar tespiti (Issue AI-011)
POST /prioritize  → XGBoost önceliklendirme (Issue AI-012)
GET  /health      → Servis durumu

Issue: AI-011, AI-012
"""
import httpx
from app.core.config import settings


async def detect_damage(image_base64: str, lat: float, lng: float) -> dict:
    """
    YOLOv8m ile hasar tespiti.
    Rapor §3.3: 7 sınıf → dominant sınıf + severity (1-5)
    """
    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.post(f"{settings.ai_service_url}/detect",
                         json={"image_base64": image_base64,
                               "location": {"lat": lat, "lng": lng}})
        r.raise_for_status()
        return r.json()


async def prioritize_requests(requests: list[dict]) -> list[dict]:
    """
    XGBoost ile talep önceliklendirme.
    Rapor §3.3: 7 özellik → 0-100 skor → azalan sıralı liste
    """
    async with httpx.AsyncClient(timeout=10.0) as c:
        r = await c.post(f"{settings.ai_service_url}/prioritize",
                         json={"requests": requests})
        r.raise_for_status()
        return r.json()["ranked_requests"]
