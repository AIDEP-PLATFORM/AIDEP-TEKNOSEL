"""
Damage Report Pydantic Şemaları
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class LocationIn(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class DamageReportCreate(BaseModel):
    description: Optional[str] = Field(None, max_length=1000)
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class DamageReportResponse(BaseModel):
    id: UUID
    user_id: UUID
    description: Optional[str]
    photo_url: str
    damage_class: Optional[str]
    severity: Optional[int]
    priority_score: Optional[float]
    status: str
    lat: Optional[float]   # frontend için düzleştirilmiş koordinat
    lng: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DamageReportListResponse(BaseModel):
    total: int
    items: list[DamageReportResponse]
