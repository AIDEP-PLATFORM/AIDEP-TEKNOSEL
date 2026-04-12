import json
from typing import Optional, List
from uuid import UUID

from geoalchemy2.functions import ST_AsGeoJSON
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.route import Route


async def create_route(
    db: AsyncSession,
    coordinates: List[List[float]],  # [[lng, lat], ...]
    duration_seconds: Optional[int] = None,
    distance_meters: Optional[float] = None,
    risk_score: Optional[float] = None,
    volunteer_id: Optional[UUID] = None,
    request_id: Optional[UUID] = None,
) -> Route:
    # GeoJSON koordinatlarını WKT LINESTRING formatına çevir
    coords_str = ", ".join(f"{lng} {lat}" for lng, lat in coordinates)
    path_wkt = f"SRID=4326;LINESTRING({coords_str})"

    route = Route(
        volunteer_id=volunteer_id,
        request_id=request_id,
        path=path_wkt,
        duration_seconds=duration_seconds,
        distance_meters=distance_meters,
        risk_score=risk_score,
        status="calculated",
    )
    db.add(route)
    await db.flush()
    await db.refresh(route)
    return route


async def get_route_by_id(
    db: AsyncSession,
    route_id: UUID,
) -> Optional[tuple]:
    """Route + path'i GeoJSON string olarak döner."""
    result = await db.execute(
        select(Route, ST_AsGeoJSON(Route.path).label("path_geojson"))
        .where(Route.id == route_id)
    )
    row = result.first()
    if row is None:
        return None
    route, path_geojson = row
    # Koordinatları parse et: [[lng, lat], ...]
    coords = []
    if path_geojson:
        geojson = json.loads(path_geojson)
        coords = geojson.get("coordinates", [])
    return route, coords
