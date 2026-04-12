"""
Volunteer & Team CRUD
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.volunteer import Volunteer
from app.models.team import Team


# ── Volunteer ─────────────────────────────────────────────────────────────────

async def create_volunteer(
    db: AsyncSession,
    user_id: UUID,
    skills: list[str] = [],
    team_id: Optional[UUID] = None,
) -> Volunteer:
    volunteer = Volunteer(user_id=user_id, skills=skills, team_id=team_id)
    db.add(volunteer)
    await db.flush()
    await db.refresh(volunteer)
    return volunteer


async def get_volunteer_by_id(db: AsyncSession, volunteer_id: UUID) -> Optional[Volunteer]:
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    return result.scalar_one_or_none()


async def get_volunteer_by_user_id(db: AsyncSession, user_id: UUID) -> Optional[Volunteer]:
    result = await db.execute(select(Volunteer).where(Volunteer.user_id == user_id))
    return result.scalar_one_or_none()


async def get_volunteers(
    db: AsyncSession,
    team_id: Optional[UUID] = None,
    is_available: Optional[bool] = None,
    no_team: bool = False,
) -> list[Volunteer]:
    query = select(Volunteer)
    if no_team:
        query = query.where(Volunteer.team_id == None)  # noqa: E711
    elif team_id:
        query = query.where(Volunteer.team_id == team_id)
    if is_available is not None:
        query = query.where(Volunteer.is_available == is_available)
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_volunteer_location(
    db: AsyncSession,
    volunteer: Volunteer,
    lat: float,
    lng: float,
) -> Volunteer:
    volunteer.current_location = f"SRID=4326;POINT({lng} {lat})"
    await db.flush()
    await db.refresh(volunteer)
    return volunteer


async def update_volunteer_availability(
    db: AsyncSession,
    volunteer: Volunteer,
    is_available: bool,
) -> Volunteer:
    volunteer.is_available = is_available
    volunteer.status = "active" if is_available else "on_mission"
    await db.flush()
    await db.refresh(volunteer)
    return volunteer


# ── Team ──────────────────────────────────────────────────────────────────────

async def create_team(
    db: AsyncSession,
    name: str,
    organization: str,
    max_size: int,
    created_by: UUID,
) -> Team:
    team = Team(name=name, organization=organization, max_size=max_size, created_by=created_by)
    db.add(team)
    await db.flush()
    await db.refresh(team)
    return team


async def get_team_by_id(db: AsyncSession, team_id: UUID) -> Optional[Team]:
    result = await db.execute(select(Team).where(Team.id == team_id))
    return result.scalar_one_or_none()


async def get_teams(
    db: AsyncSession,
    status: Optional[str] = None,
    organization: Optional[str] = None,
) -> list[Team]:
    query = select(Team)
    if status:
        query = query.where(Team.status == status)
    if organization:
        query = query.where(Team.organization == organization)
    query = query.order_by(Team.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def assign_team_to_damage(
    db: AsyncSession,
    team: Team,
    damage_report_id: UUID,
) -> Team:
    team.assigned_damage_id = damage_report_id
    team.status = "on_mission"
    await db.flush()
    await db.refresh(team)
    return team


async def update_team_status(
    db: AsyncSession,
    team: Team,
    status: str,
) -> Team:
    team.status = status
    if status == "available":
        team.assigned_damage_id = None
    await db.flush()
    await db.refresh(team)
    return team


async def get_team_member_count(db: AsyncSession, team_id: UUID) -> int:
    result = await db.execute(
        select(func.count()).where(Volunteer.team_id == team_id)
    )
    return result.scalar_one()


async def add_volunteer_to_team(
    db: AsyncSession,
    volunteer: Volunteer,
    team_id: UUID,
) -> Volunteer:
    volunteer.team_id = team_id
    await db.flush()
    await db.refresh(volunteer)
    return volunteer
