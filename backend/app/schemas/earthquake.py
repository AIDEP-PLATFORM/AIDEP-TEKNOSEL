from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EarthquakeOut(BaseModel):
    id: str                          # Kaynak sistemdeki unique ID
    magnitude: float
    depth_km: Optional[float]
    lat: float
    lng: float
    location_name: str
    event_time: datetime
    source: str                      # "USGS", "AFAD", "KANDILLI"
    url: Optional[str] = None        # Orijinal kaynak linki

    class Config:
        from_attributes = True


class EarthquakeListResponse(BaseModel):
    total: int
    items: list[EarthquakeOut]
