"""
Damage Report CRUD
"""
from typing import Optional
from uuid import UUID

from geoalchemy2 import Geometry
from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.damage_report import DamageReport

_GEOM = Geometry(geometry_type="POINT", srid=4326)


def _location_lat_lng_exprs():
    """Geography POINT → PostGIS ST_Y/ST_X (async ortamda to_shape güvenilir değil)."""
    geom = cast(DamageReport.location, _GEOM)
    return func.ST_Y(geom).label("lat"), func.ST_X(geom).label("lng")


async def create_damage_report(
    db: AsyncSession,
    user_id: UUID,
    photo_url: str,
    lat: float,
    lng: float,
    description: Optional[str] = None,
    damage_class: Optional[str] = None,
    severity: Optional[int] = None,
    priority_score: Optional[float] = None,
    analysis_results: Optional[list] = None,
    status: str = "verified",
) -> DamageReport:
    report = DamageReport(
        user_id=user_id,
        photo_url=photo_url,
        location=f"SRID=4326;POINT({lng} {lat})",
        description=description,
        damage_class=damage_class,
        severity=severity,
        priority_score=priority_score,
        analysis_results=analysis_results,
        status=status,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return report


async def get_damage_report_by_id(
    db: AsyncSession,
    report_id: UUID,
) -> Optional[DamageReport]:
    result = await db.execute(
        select(DamageReport).where(DamageReport.id == report_id)
    )
    return result.scalar_one_or_none()


async def get_damage_report_by_id_with_coords(
    db: AsyncSession,
    report_id: UUID,
) -> Optional[tuple[DamageReport, Optional[float], Optional[float]]]:
    lat_e, lng_e = _location_lat_lng_exprs()
    stmt = (
        select(DamageReport, lat_e, lng_e).where(DamageReport.id == report_id)
    )
    row = (await db.execute(stmt)).one_or_none()
    if row is None:
        return None
    return row[0], row[1], row[2]


async def get_damage_reports(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    severity_min: Optional[int] = None,
    status: Optional[str] = None,
) -> tuple[int, list[tuple[DamageReport, Optional[float], Optional[float]]]]:
    lat_e, lng_e = _location_lat_lng_exprs()
    query = select(DamageReport, lat_e, lng_e)

    if severity_min is not None:
        query = query.where(DamageReport.severity >= severity_min)
    if status:
        query = query.where(DamageReport.status == status)

    query = query.order_by(DamageReport.severity.desc().nullslast(), DamageReport.created_at.desc())

    count_base = select(DamageReport)
    if severity_min is not None:
        count_base = count_base.where(DamageReport.severity >= severity_min)
    if status:
        count_base = count_base.where(DamageReport.status == status)
    count_query = select(func.count()).select_from(count_base.subquery())
    total = (await db.execute(count_query)).scalar_one()

    result = await db.execute(query.offset(skip).limit(limit))
    items = [(r[0], r[1], r[2]) for r in result.all()]

    return total, items
