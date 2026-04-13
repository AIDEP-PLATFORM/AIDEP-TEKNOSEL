from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class RouteStep(BaseModel):
    instruction: str          # Türkçe yön talimatı: "Sağa dön", "Düz devam et"
    distance_meters: float    # Bu adımın mesafesi
    duration_seconds: float   # Bu adımın süresi
    street_name: str          # Sokak/cadde adı
    location: List[float]     # [lng, lat] — talimatın verileceği nokta


class RouteAlternative(BaseModel):
    index: int                        # 0 = en güvenli rota
    coordinates: List[List[float]]    # [[lng, lat], ...]
    steps: List[RouteStep] = []
    duration_seconds: int
    distance_meters: float
    risk_score: float
    is_best: bool


class RouteCalculateRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    volunteer_id: Optional[UUID] = None
    request_id: Optional[UUID] = None


class RouteResponse(BaseModel):
    id: UUID
    volunteer_id: Optional[UUID]
    request_id: Optional[UUID]
    coordinates: List[List[float]]      # En güvenli rota koordinatları
    steps: List[RouteStep] = []
    duration_seconds: Optional[int]
    distance_meters: Optional[float]
    risk_score: Optional[float]
    status: str
    created_at: Optional[datetime]
    alternatives: List[RouteAlternative] = []  # Tüm alternatifler (risk sıralı)

    model_config = {"from_attributes": True}
