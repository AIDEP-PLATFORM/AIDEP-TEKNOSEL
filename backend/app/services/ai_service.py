"""
AI Service Client — YOLOv8s hasar tespiti + XGBoost önceliklendirme
Backend → ai-service (http://ai:8001) HTTP köprüsü
"""
import base64
import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

AI_TIMEOUT = 30.0  # saniye — YOLO inference CPU'da ~5-15s sürebilir


# ── Detect ────────────────────────────────────────────────────────────────────

async def call_detect(
    image_bytes: bytes,
    lat: float,
    lng: float,
    threshold: float = 0.5,
) -> Optional[dict]:
    """
    AI servisine fotoğraf gönderir, hasar tespiti sonucunu döner.

    Dönen dict:
        {
            "damage_class": str,       # baskın sınıf (ör. bina_yikilmis)
            "severity": int,           # 1-5 (0 = tespit yok)
            "detections": list[dict],  # [{class_name, confidence, bbox}]
            "processing_time_ms": float
        }

    AI servisi kapalıysa veya hata verirse None döner —
    rapor yine kaydedilir, AI alanları boş kalır.
    """
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "image_base64": image_base64,
        "location": {"lat": lat, "lng": lng},
        "threshold": threshold,
    }

    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            response = await client.post(
                f"{settings.ai_service_url}/detect",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

            return {
                "damage_class": data.get("damage_class", "pending"),
                "severity": data.get("severity", 0),
                "detections": data.get("detections", []),
                "processing_time_ms": data.get("processing_time_ms", 0.0),
            }

    except httpx.TimeoutException:
        logger.warning("AI servisi zaman aşımına uğradı (timeout=%.1fs)", AI_TIMEOUT)
        return None
    except httpx.ConnectError:
        logger.warning("AI servisine bağlanılamadı: %s", settings.ai_service_url)
        return None
    except Exception as e:
        logger.error("AI servis hatası: %s", str(e))
        return None


# ── Prioritize ────────────────────────────────────────────────────────────────

async def call_prioritize(requests: list[dict]) -> Optional[list[dict]]:
    """
    XGBoost önceliklendirme endpoint'ini çağırır.

    Her item şu alanları içermeli:
        id, urgency_level, waiting_time_min, distance_km,
        need_type, weather_score, population, damage_score

    Dönen liste: [{id, priority_score, rank}]
    Hata durumunda None döner.
    """
    if not requests:
        return []

    payload = {"requests": requests}

    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            response = await client.post(
                f"{settings.ai_service_url}/prioritize",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("ranked_requests", [])

    except Exception as e:
        logger.error("Prioritize servis hatası: %s", str(e))
        return None
