"""
Damage Report CRUD
"""
from typing import Optional
from uuid import UUID

from geoalchemy2.functions import ST_AsText
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.damage_report import DamageReport


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


async def get_damage_reports(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    severity_min: Optional[int] = None,
    status: Optional[str] = None,
) -> tuple[int, list[DamageReport]]:
    query = select(DamageReport)

    if severity_min is not None:
        query = query.where(DamageReport.severity >= severity_min)
    if status:
        query = query.where(DamageReport.status == status)

    query = query.order_by(DamageReport.severity.desc().nullslast(), DamageReport.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    result = await db.execute(query.offset(skip).limit(limit))
    items = list(result.scalars().all())

    return total, items
