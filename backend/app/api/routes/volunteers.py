"""
Volunteer & Team Routes

Gönüllü:
  POST   /volunteers/me               — Gönüllü profili oluştur
  GET    /volunteers                  — Tüm gönüllüleri listele (yetkili)
  PATCH  /volunteers/me/location      — Konum güncelle
  PATCH  /volunteers/me/availability  — Müsaitlik güncelle

Ekip (STK Yetkilisi):
  POST   /volunteers/teams                      — Ekip oluştur
  GET    /volunteers/teams                      — Ekipleri listele
  GET    /volunteers/teams/{id}                 — Ekip detayı
  POST   /volunteers/teams/{id}/members         — Ekibe gönüllü ekle
  DELETE /volunteers/teams/{id}/members/{v_id}  — Ekipten gönüllü çıkar
  POST   /volunteers/teams/{id}/assign          — Ekibi hasara ata
  PATCH  /volunteers/teams/{id}/status          — Ekip durumunu güncelle
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.crud.volunteer import (
    create_volunteer, get_volunteer_by_user_id, get_volunteers,
    update_volunteer_location, update_volunteer_availability,
    create_team, get_team_by_id, get_teams,
    assign_team_to_damage, update_team_status,
    get_team_member_count, add_volunteer_to_team,
)
from app.crud.damage_report import get_damage_report_by_id
from app.models.user import User
from app.schemas.volunteer import (
    VolunteerCreate, VolunteerLocationUpdate,
    VolunteerAvailabilityUpdate, VolunteerResponse,
)
from app.schemas.team import TeamCreate, TeamResponse, TeamAssign, TeamStatusUpdate, TeamAddMember

router = APIRouter()

STK_ROLES = {"stk_official", "admin"}


# ── Gönüllü endpoint'leri ─────────────────────────────────────────────────────

@router.post("/me", response_model=VolunteerResponse, status_code=status.HTTP_201_CREATED)
async def register_as_volunteer(
    body: VolunteerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await get_volunteer_by_user_id(db, current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Zaten gönüllü olarak kayıtlısınız")

    volunteer = await create_volunteer(db, current_user.id, [], None)
    await db.commit()
    return _volunteer_to_response(volunteer)


@router.get("", response_model=list[VolunteerResponse])
async def list_volunteers(
    team_id: Optional[UUID] = None,
    is_available: Optional[bool] = None,
    no_team: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Gönüllüleri listele (STK Yetkilisi).
    no_team=true → henüz hiçbir ekibe atanmamış gönüllüler
    team_id=...  → belirli ekipteki gönüllüler
    """
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")
    volunteers = await get_volunteers(db, team_id=team_id, is_available=is_available, no_team=no_team)
    return [_volunteer_to_response(v) for v in volunteers]


@router.patch("/me/location", response_model=VolunteerResponse)
async def update_my_location(
    body: VolunteerLocationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    volunteer = await get_volunteer_by_user_id(db, current_user.id)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Gönüllü profili bulunamadı")
    volunteer = await update_volunteer_location(db, volunteer, body.lat, body.lng)
    await db.commit()
    return _volunteer_to_response(volunteer, body.lat, body.lng)


@router.patch("/me/availability", response_model=VolunteerResponse)
async def update_my_availability(
    body: VolunteerAvailabilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    volunteer = await get_volunteer_by_user_id(db, current_user.id)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Gönüllü profili bulunamadı")
    volunteer = await update_volunteer_availability(db, volunteer, body.is_available)
    await db.commit()
    return _volunteer_to_response(volunteer)


# ── Ekip endpoint'leri (STK Yetkilisi) ───────────────────────────────────────

@router.post("/teams", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_new_team(
    body: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")
    team = await create_team(db, body.name, body.organization, body.max_size, current_user.id)
    await db.commit()
    return await _team_to_response(db, team)


@router.get("/teams", response_model=list[TeamResponse])
async def list_teams(
    team_status: Optional[str] = None,
    organization: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")
    teams = await get_teams(db, status=team_status, organization=organization)
    return [await _team_to_response(db, t) for t in teams]


@router.get("/teams/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")
    team = await get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Ekip bulunamadı")
    return await _team_to_response(db, team)


@router.post("/teams/{team_id}/members", response_model=TeamResponse)
async def add_member_to_team(
    team_id: UUID,
    body: TeamAddMember,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ekibe gönüllü ekle (STK Yetkilisi)"""
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")

    team = await get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Ekip bulunamadı")

    member_count = await get_team_member_count(db, team_id)
    if member_count >= team.max_size:
        raise HTTPException(status_code=400, detail=f"Ekip dolu (max {team.max_size} kişi)")

    from app.crud.volunteer import get_volunteer_by_id
    volunteer = await get_volunteer_by_id(db, body.volunteer_id)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Gönüllü bulunamadı")

    volunteer = await add_volunteer_to_team(db, volunteer, team_id)
    await db.commit()
    return await _team_to_response(db, team)


@router.delete("/teams/{team_id}/members/{volunteer_id}", response_model=TeamResponse)
async def remove_member_from_team(
    team_id: UUID,
    volunteer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ekipten gönüllü çıkar (STK Yetkilisi)"""
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")

    from app.crud.volunteer import get_volunteer_by_id
    volunteer = await get_volunteer_by_id(db, volunteer_id)
    if not volunteer or volunteer.team_id != team_id:
        raise HTTPException(status_code=404, detail="Gönüllü bu ekipte bulunamadı")

    volunteer = await add_volunteer_to_team(db, volunteer, None)
    await db.commit()

    team = await get_team_by_id(db, team_id)
    return await _team_to_response(db, team)


@router.post("/teams/{team_id}/assign", response_model=TeamResponse)
async def assign_team(
    team_id: UUID,
    body: TeamAssign,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ekibi hasarlı binaya ata (STK Yetkilisi)"""
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")

    team = await get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Ekip bulunamadı")
    if team.status != "available":
        raise HTTPException(status_code=400, detail="Ekip şu an müsait değil")

    damage = await get_damage_report_by_id(db, body.damage_report_id)
    if not damage:
        raise HTTPException(status_code=404, detail="Hasar raporu bulunamadı")

    team = await assign_team_to_damage(db, team, body.damage_report_id)
    await db.commit()
    return await _team_to_response(db, team)


@router.patch("/teams/{team_id}/status", response_model=TeamResponse)
async def update_team_status_endpoint(
    team_id: UUID,
    body: TeamStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in STK_ROLES:
        raise HTTPException(status_code=403, detail="Yetkiniz yok")

    team = await get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Ekip bulunamadı")

    allowed = {"available", "on_mission", "inactive"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Geçerli durumlar: {allowed}")

    team = await update_team_status(db, team, body.status)
    await db.commit()
    return await _team_to_response(db, team)


# ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────

def _extract_coords(obj):
    try:
        if obj is None:
            return None, None
        from geoalchemy2.shape import to_shape
        point = to_shape(obj)
        return point.y, point.x
    except Exception:
        return None, None


def _volunteer_to_response(volunteer, lat=None, lng=None) -> VolunteerResponse:
    if lat is None and lng is None:
        lat, lng = _extract_coords(volunteer.current_location)
    return VolunteerResponse(
        id=volunteer.id,
        user_id=volunteer.user_id,
        skills=volunteer.skills or [],
        team_id=volunteer.team_id,
        is_available=volunteer.is_available,
        status=volunteer.status,
        lat=lat,
        lng=lng,
        created_at=volunteer.created_at,
    )


async def _team_to_response(db, team) -> TeamResponse:
    member_count = await get_team_member_count(db, team.id)
    lat, lng = _extract_coords(team.current_location)
    return TeamResponse(
        id=team.id,
        name=team.name,
        organization=team.organization,
        max_size=team.max_size,
        status=team.status,
        assigned_damage_id=team.assigned_damage_id,
        member_count=member_count,
        lat=lat,
        lng=lng,
        created_at=team.created_at,
    )
