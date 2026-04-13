import httpx
from app.core.config import settings


async def get_routes_from_osrm(
    start_lon: float,
    start_lat: float,
    end_lon: float,
    end_lat: float,
) -> dict:
    """
    OSRM'e istek atarak başlangıç → bitiş arasındaki rotaları döner.
    alternatives=true → birden fazla rota seçeneği ister.
    geometries=geojson → koordinatları GeoJSON formatında alır.
    overview=full → rotanın tüm koordinatlarını döner.
    """
    url = (
        f"{settings.osrm_url}/route/v1/driving/"
        f"{start_lon},{start_lat};{end_lon},{end_lat}"
        f"?alternatives=true&geometries=geojson&overview=full&steps=true"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
