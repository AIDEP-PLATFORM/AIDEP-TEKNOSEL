from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


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
    coordinates: List[List[float]]  # [[lng, lat], [lng, lat], ...]
    duration_seconds: Optional[int]
    distance_meters: Optional[float]
    risk_score: Optional[float]
    status: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
