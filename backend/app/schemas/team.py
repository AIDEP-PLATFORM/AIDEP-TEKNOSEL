"""
Team Pydantic Şemaları
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TeamCreate(BaseModel):
    name: str = Field(..., max_length=255)
    organization: str = Field(..., max_length=255)
    max_size: int = Field(10, ge=2, le=50)


class TeamResponse(BaseModel):
    id: UUID
    name: str
    organization: str
    max_size: int
    status: str
    assigned_damage_id: Optional[UUID]
    member_count: Optional[int] = None
    lat: Optional[float]
    lng: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


class TeamAssign(BaseModel):
    damage_report_id: UUID


class TeamStatusUpdate(BaseModel):
    status: str  # available | on_mission | inactive


class TeamAddMember(BaseModel):
    volunteer_id: UUID


class TeamMemberLocation(BaseModel):
    volunteer_id: UUID
    lat: Optional[float]
    lng: Optional[float]


class TeamLocationResponse(BaseModel):
    team_id: UUID
    team_name: str
    status: str
    assigned_damage_id: Optional[UUID]
    damage_lat: Optional[float]
    damage_lng: Optional[float]
    members: list[TeamMemberLocation]
