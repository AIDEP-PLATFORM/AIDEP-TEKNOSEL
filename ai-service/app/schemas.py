"""
AI Servis Pydantic Şemaları — Rapor §3.3
"""
from pydantic import BaseModel

# ── /detect — YOLOv8s 11 sınıf ───────────────────────────────
class DetectRequest(BaseModel):
    image_base64: str
    location: dict           # {lat, lng}
    threshold: float = 0.5

class Detection(BaseModel):
    class_name: str          # bina_yikilmis|bina_cok_riskli|bina_riskli|bina_saglam|
                             # yol_yikilmis|yol_gecilemez|yol_cok_hasarli|
                             # yol_orta_hasarli|yol_az_hasarli|yol_gecilebilir|yol_saglam
    confidence: float        # 0-1
    bbox: list[float]        # [x1,y1,x2,y2]

class DetectResponse(BaseModel):
    detections: list[Detection]
    damage_class: str        # baskın sınıf
    severity: int            # 1-5
    processing_time_ms: float

# ── /prioritize — XGBoost 7 özellik ──────────────────────────
# Rapor §3.3: urgency, waiting_time, distance, need_type,
#              weather_score, population, damage_score
class RequestItem(BaseModel):
    id: int
    urgency_level: int = 1           # 1-5 (aciliyet, ağırlık %25)
    waiting_time_min: float = 0.0    # bekleme süresi (%20)
    distance_km: float = 5.0         # en yakın gönüllü mesafesi (%10)
    need_type: str = "food"          # rescue|medical|shelter|food (%18)
    weather_score: float = 0.0       # MGM API 0-100 (%5)
    population: int = 1              # kişi sayısı (%7)
    damage_score: float = 0.0        # YOLOv8 çıktısı 0-100 (%15)

class RankedItem(BaseModel):
    id: int
    priority_score: float    # 0-100
    rank: int

class PrioritizeRequest(BaseModel):
    requests: list[RequestItem]

class PrioritizeResponse(BaseModel):
    ranked_requests: list[RankedItem]
    processing_time_ms: float
