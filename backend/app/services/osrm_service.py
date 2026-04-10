import httpx
import logging

logger = logging.getLogger(__name__)

class OSRMService:
    def __init__(self):
        # Docker Compose ağında servis adı 'osrm' olduğu için bu URL kullanılır
        # Eğer Docker dışında test ediyorsan http://localhost:5000 yapmalısın
        self.base_url = "http://osrm:5000/route/v1/driving"

    async def get_route(self, start_coords: str, end_coords: str):
        """
        start_coords ve end_coords formatı: "long,lat" (Örn: "32.49,37.87")
        """
        try:
            url = f"{self.base_url}/{start_coords};{end_coords}"
            params = {
                "overview": "full",      # Tüm rota çizgisini ver
                "geometries": "geojson", # Frontend (Leaflet/Mapbox) için uygun format
                "steps": "true"          # Adım adım yönergeler
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                
                if response.status_code != 200:
                    logger.error(f"OSRM Hatası: {response.text}")
                    return None
                
                return response.json()

        except Exception as e:
            logger.error(f"OSRM Servis hatası: {str(e)}")
            return None

    async def get_safe_route(self, start_coords: str, end_coords: str, damaged_zones: list):
        """
        BURASI SENİN FARKIN! 
        Gelen rotayı Supabase'den gelen hasarlı bölgelerle karşılaştıracak olan fonksiyon.
        """
        # 1. Önce normal rotayı al
        route_data = await self.get_route(start_coords, end_coords)
        
        # 2. TODO: Burada hasarlı bölgelerle rotayı çakıştırıp 
        # gerekirse alternatif rotayı seçeceğiz.
        
        return route_data

# Servisi başlatıyoruz
osrm_service = OSRMService()