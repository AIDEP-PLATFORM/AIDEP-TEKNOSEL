"""
Volunteer Pydantic Şemaları
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class VolunteerCreate(BaseModel):
    pass


class VolunteerLocationUpdate(BaseModel):
    lat: float
    lng: float


class VolunteerAvailabilityUpdate(BaseModel):
    is_available: bool


class VolunteerResponse(BaseModel):
    id: UUID
    user_id: UUID
    skills: list[str]
    team_id: Optional[UUID]
    is_available: bool
    status: str
    lat: Optional[float]
    lng: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}
