"""
Rota hesaplama iş mantığı.

1. DB'den kritik yol hasarı raporlarını çek
2. OSRM'den alternatif rotaları al
3. Her rota için risk_score hesapla (kaç hasarlı nokta rotaya yakın)
4. En düşük risk_score'lu rotayı seç
"""
import math
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.damage_report import DamageReport
from app.services.osrm_service import get_routes_from_osrm
from app.crud.route import create_route

# Rota üzerinde hasar noktası sayılacak mesafe eşiği (metre)
DAMAGE_RADIUS_METERS = 100
# Her hasarlı nokta için risk puanı
RISK_PER_DAMAGE = 0.1


async def get_critical_road_damage_reports(db: AsyncSession) -> list:
    """
    damage_reports tablosundan kritik yol hasarı olan raporları çeker.
    - severity >= 4 (ağır hasar)
    - damage_class içinde 'yol' geçenler
    """
    result = await db.execute(
        select(DamageReport).where(
            DamageReport.severity >= 4,
            DamageReport.damage_class.ilike("%yol%"),
            DamageReport.status == "verified",
        )
    )
    return list(result.scalars().all())


def _haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """İki koordinat arasındaki mesafeyi metre cinsinden hesaplar."""
    R = 6371000  # Dünya yarıçapı (metre)
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _calculate_risk_score(
    route_coords: list,
    damage_reports: list,
) -> float:
    """
    Rota koordinatlarına yakın kaç hasarlı nokta var sayar.
    Her hasarlı nokta = +0.1 risk puanı.
    """
    score = 0.0
    for report in damage_reports:
        try:
            from geoalchemy2.shape import to_shape
            point = to_shape(report.location)
            damage_lat, damage_lng = point.y, point.x
        except Exception:
            continue

        # Rotadaki herhangi bir koordinata yeterince yakınsa sayılır
        for lng, lat in route_coords:
            dist = _haversine_distance(lat, lng, damage_lat, damage_lng)
            if dist <= DAMAGE_RADIUS_METERS:
                score += RISK_PER_DAMAGE
                break  # Bu hasar noktası sayıldı, bir sonrakine geç

    return round(score, 2)


def _maneuver_to_turkish(maneuver_type: str, modifier: str) -> str:
    """OSRM maneuver tipini Türkçe yön talimatına çevirir."""
    if maneuver_type == "depart":
        return "Başlangıç noktasından hareket et"
    if maneuver_type == "arrive":
        return "Hedefe ulaştınız"
    if maneuver_type in ("turn", "new name"):
        mapping = {
            "right": "Sağa dön",
            "left": "Sola dön",
            "slight right": "Hafif sağa dön",
            "slight left": "Hafif sola dön",
            "sharp right": "Keskin sağa dön",
            "sharp left": "Keskin sola dön",
            "straight": "Düz devam et",
            "uturn": "Geri dön",
        }
        return mapping.get(modifier, "Düz devam et")
    if maneuver_type == "roundabout":
        return "Dönel kavşağa gir"
    if maneuver_type == "fork":
        return "Sağ yoldan devam et" if "right" in modifier else "Sol yoldan devam et"
    if maneuver_type == "merge":
        return "Yola birleş"
    return "Düz devam et"


def _extract_steps(osrm_route: dict) -> list:
    """
    OSRM route objesinden adım adım yön talimatlarını çıkarır.
    Her leg'in steps listesini birleştirir.
    """
    steps = []
    for leg in osrm_route.get("legs", []):
        for step in leg.get("steps", []):
            maneuver = step.get("maneuver", {})
            maneuver_type = maneuver.get("type", "")
            modifier = maneuver.get("modifier", "straight")
            location = maneuver.get("location", [0, 0])

            steps.append({
                "instruction": _maneuver_to_turkish(maneuver_type, modifier),
                "distance_meters": step.get("distance", 0),
                "duration_seconds": step.get("duration", 0),
                "street_name": step.get("name", ""),
                "location": location,
            })
    return steps


async def calculate_and_save_route(
    db: AsyncSession,
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
    volunteer_id: Optional[UUID] = None,
    request_id: Optional[UUID] = None,
):
    """
    Ana fonksiyon:
    1. OSRM'den alternatif rotaları al
    2. Kritik yol hasarlarını çek
    3. Her rota için risk_score hesapla
    4. En güvenli rotayı seç ve kaydet
    """
    # OSRM'den rotaları al
    osrm_data = await get_routes_from_osrm(start_lon=start_lng, start_lat=start_lat, end_lon=end_lng, end_lat=end_lat)

    routes = osrm_data.get("routes", [])
    if not routes:
        raise ValueError("OSRM rota bulamadı")

    # Kritik yol hasarlarını çek
    damage_reports = await get_critical_road_damage_reports(db)

    # Her rota için risk_score hesapla
    best_route = None
    best_score = float("inf")

    for route in routes:
        coords = route.get("geometry", {}).get("coordinates", [])
        if not coords:
            continue

        score = _calculate_risk_score(coords, damage_reports)

        if score < best_score:
            best_score = score
            best_route = route
            best_coords = coords

    if not best_route:
        raise ValueError("Geçerli rota bulunamadı")

    # En iyi rotayı veritabanına kaydet
    duration = int(best_route.get("duration", 0))
    distance = float(best_route.get("distance", 0))

    saved_route = await create_route(
        db=db,
        coordinates=best_coords,
        duration_seconds=duration,
        distance_meters=distance,
        risk_score=best_score,
        volunteer_id=volunteer_id,
        request_id=request_id,
    )

    # Adım adım yön talimatlarını çıkar
    steps = _extract_steps(best_route)

    return saved_route, best_coords, steps
