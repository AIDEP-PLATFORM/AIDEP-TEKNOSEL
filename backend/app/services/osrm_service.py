"""
OSRM Rota Motoru İstemcisi
============================
Türkiye OSM verisi, güvenli rota hesaplama.
Enhanced Greedy için distance_table kullanılır.

Issue: BE2-001
"""
import httpx
from app.core.config import settings


async def get_route(origin: tuple, destination: tuple, alternatives: int = 3) -> dict:
    coords = f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
    async with httpx.AsyncClient(timeout=10.0) as c:
        r = await c.get(f"{settings.osrm_url}/route/v1/driving/{coords}",
                        params={"alternatives": alternatives,
                                "geometries": "geojson", "steps": "true"})
        r.raise_for_status()
        return r.json()


async def get_distance_table(coords: list[tuple]) -> list[list[float]]:
    """Toplu mesafe matrisi — Enhanced Greedy için (AI-013)"""
    s = ";".join(f"{lng},{lat}" for lat, lng in coords)
    async with httpx.AsyncClient(timeout=15.0) as c:
        r = await c.get(f"{settings.osrm_url}/table/v1/driving/{s}",
                        params={"annotations": "duration"})
        r.raise_for_status()
        return r.json()["durations"]
