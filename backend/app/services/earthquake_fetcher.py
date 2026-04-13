"""
Deprem verisi çekme servisi.

Öncelik sırası:
  1. AFAD API        — kurumsal başvuru gerektirir (settings.afad_api_key)
  2. Kandilli FDSN   — API key gerektirmez, Türkiye'ye özel, Boğaziçi Üniversitesi
  3. USGS FDSN       — API key gerektirmez, global, güvenilir yedek

Türkiye bounding box: lat 35-43, lng 25-45
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx

from app.core.config import settings
from app.schemas.earthquake import EarthquakeOut

logger = logging.getLogger(__name__)

# Türkiye sınırları
_TR_MIN_LAT = 35.0
_TR_MAX_LAT = 43.0
_TR_MIN_LNG = 25.0
_TR_MAX_LNG = 45.0


async def fetch_usgs(
    min_mag: float = 2.0,
    hours: int = 48,
    limit: int = 100,
) -> list[EarthquakeOut]:
    """USGS FDSN API'den Türkiye depremi çeker."""
    start_time = (datetime.now(timezone.utc) - timedelta(hours=hours)).strftime(
        "%Y-%m-%dT%H:%M:%S"
    )
    url = (
        "https://earthquake.usgs.gov/fdsnws/event/1/query"
        f"?format=geojson"
        f"&minmagnitude={min_mag}"
        f"&minlatitude={_TR_MIN_LAT}&maxlatitude={_TR_MAX_LAT}"
        f"&minlongitude={_TR_MIN_LNG}&maxlongitude={_TR_MAX_LNG}"
        f"&orderby=time&limit={limit}"
        f"&starttime={start_time}"
    )
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("USGS fetch failed: %s", exc)
        return []

    results: list[EarthquakeOut] = []
    for feat in data.get("features", []):
        try:
            props = feat["properties"]
            coords = feat["geometry"]["coordinates"]  # [lng, lat, depth]
            eq = EarthquakeOut(
                id=feat["id"],
                magnitude=float(props["mag"]),
                depth_km=float(coords[2]) if coords[2] is not None else None,
                lat=float(coords[1]),
                lng=float(coords[0]),
                location_name=props.get("place") or "Bilinmiyor",
                event_time=datetime.fromtimestamp(
                    props["time"] / 1000, tz=timezone.utc
                ),
                source="USGS",
                url=props.get("url"),
            )
            results.append(eq)
        except Exception:
            continue

    return results


async def fetch_afad(
    min_mag: float = 2.0,
    hours: int = 48,
    limit: int = 100,
) -> list[EarthquakeOut]:
    """
    AFAD Deprem API'den veri çeker.
    API key gerektirir (settings.afad_api_key).
    """
    if not settings.afad_api_key:
        return []

    start_time = (datetime.now(timezone.utc) - timedelta(hours=hours)).strftime(
        "%Y-%m-%dT%H:%M:%S"
    )
    url = "https://deprem.afad.gov.tr/apiv2/event/filter"
    params = {
        "start": start_time,
        "minmag": min_mag,
        "minlat": _TR_MIN_LAT,
        "maxlat": _TR_MAX_LAT,
        "minlon": _TR_MIN_LNG,
        "maxlon": _TR_MAX_LNG,
        "limit": limit,
        "orderby": "timedesc",
    }
    headers = {"Authorization": f"Bearer {settings.afad_api_key}"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("AFAD fetch failed: %s", exc)
        return []

    results: list[EarthquakeOut] = []
    for item in data if isinstance(data, list) else data.get("eventList", []):
        try:
            eq = EarthquakeOut(
                id=str(item.get("eventID") or item.get("id", "")),
                magnitude=float(item["magnitude"]),
                depth_km=float(item["depth"]) if item.get("depth") is not None else None,
                lat=float(item["latitude"]),
                lng=float(item["longitude"]),
                location_name=item.get("location") or item.get("locationName") or "Bilinmiyor",
                event_time=datetime.fromisoformat(
                    str(item.get("date") or item.get("eventDate", "")).replace("Z", "+00:00")
                ),
                source="AFAD",
                url=None,
            )
            results.append(eq)
        except Exception:
            continue

    return results


async def fetch_kandilli(
    min_mag: float = 2.0,
    hours: int = 48,
    limit: int = 100,
) -> list[EarthquakeOut]:
    """
    Kandilli Rasathanesi FDSN servisi — API key gerektirmez.
    Türkiye'ye özel, Boğaziçi Üniversitesi KOERI tarafından sağlanır.
    """
    start_time = (datetime.now(timezone.utc) - timedelta(hours=hours)).strftime(
        "%Y-%m-%dT%H:%M:%S"
    )
    url = (
        "http://eida.koeri.boun.edu.tr/fdsnws/event/1/query"
        f"?format=json"
        f"&minmagnitude={min_mag}"
        f"&minlatitude={_TR_MIN_LAT}&maxlatitude={_TR_MAX_LAT}"
        f"&minlongitude={_TR_MIN_LNG}&maxlongitude={_TR_MAX_LNG}"
        f"&orderby=time&limit={limit}"
        f"&starttime={start_time}"
    )
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("Kandilli fetch failed: %s", exc)
        return []

    results: list[EarthquakeOut] = []
    for feat in data.get("features", []):
        try:
            props = feat["properties"]
            coords = feat["geometry"]["coordinates"]  # [lng, lat, depth]
            eq = EarthquakeOut(
                id=str(feat.get("id") or feat.get("properties", {}).get("publicid", "")),
                magnitude=float(props["mag"]),
                depth_km=float(coords[2]) if len(coords) > 2 and coords[2] is not None else None,
                lat=float(coords[1]),
                lng=float(coords[0]),
                location_name=props.get("place") or props.get("description") or "Türkiye",
                event_time=datetime.fromisoformat(
                    str(props.get("time", "")).replace("Z", "+00:00")
                ),
                source="Kandilli",
                url=None,
            )
            results.append(eq)
        except Exception:
            continue

    return results


async def fetch_earthquakes(
    min_mag: float = 2.0,
    hours: int = 48,
    limit: int = 100,
) -> list[EarthquakeOut]:
    """
    Öncelik: AFAD (key varsa) → Kandilli FDSN → USGS FDSN.
    İlk başarılı kaynaktan döner.
    """
    if settings.afad_api_key:
        data = await fetch_afad(min_mag, hours, limit)
        if data:
            return data

    # Kandilli'yi dene
    data = await fetch_kandilli(min_mag, hours, limit)
    if data:
        return data

    # Yedek: USGS
    return await fetch_usgs(min_mag, hours, limit)
