"""
Deprem Rotaları
GET /earthquakes        — Son depremleri listele (USGS/AFAD)
GET /earthquakes/latest — En son tek deprem
"""
import logging
from typing import Optional

from fastapi import APIRouter, Query

from app.schemas.earthquake import EarthquakeListResponse, EarthquakeOut
from app.services.earthquake_fetcher import fetch_earthquakes

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=EarthquakeListResponse)
async def list_earthquakes(
    min_mag: float = Query(2.0, ge=0.0, le=10.0, description="Minimum büyüklük"),
    hours: int = Query(48, ge=1, le=168, description="Kaç saat geriye bak (max 7 gün)"),
    limit: int = Query(100, ge=1, le=500),
):
    """
    Türkiye çevresindeki son depremleri döner.
    Önce AFAD (API key varsa), yoksa USGS FDSN kullanılır.
    """
    items = await fetch_earthquakes(min_mag=min_mag, hours=hours, limit=limit)
    return EarthquakeListResponse(total=len(items), items=items)


@router.get("/latest", response_model=Optional[EarthquakeOut])
async def latest_earthquake(
    min_mag: float = Query(3.0, ge=0.0, le=10.0),
):
    """En son tek depremi döner."""
    items = await fetch_earthquakes(min_mag=min_mag, hours=24, limit=1)
    return items[0] if items else None
