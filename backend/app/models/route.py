# OSRM'in gönüllüler için hesapladığı güzergahları tutuyor.
import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from app.models.base import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    request_id = Column(UUID(as_uuid=True), ForeignKey("requests.id", ondelete="CASCADE"), nullable=True, index=True)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("volunteers.user_id", ondelete="CASCADE"), nullable=True, index=True)
    
    path = Column(Geography(geometry_type='LINESTRING', srid=4326, spatial_index=False), nullable=False) # POINT → Tek bir nokta. Enlem, boylam, LINESTRING → Birden fazla noktanın birleşimi, yani bir güzergah
    
    duration_seconds = Column(Integer, nullable=True) # OSRM'in hesapladığı tahmini süre. Örnek: 1800 → 30 dakika
    distance_meters = Column(Float, nullable=True) #  Toplam mesafe. Örnek: 4500.0 → 4.5 km
    risk_score = Column(Float, nullable=True) # Sadece mesafe ve süreye bakılmıyor. Rota üzerindeki hasar raporlarına da bakılıyor. Çökmüş bina, yıkık yol varsa risk skoru yükseliyor ve alternatif güzergah öneriliyor. Hesaplanmamışsa NULL kalır.
    
    status = Column(String(50), nullable=False, default="calculated") # calculated → Rota hesaplandı, henüz kullanılmıyor, active → Gönüllü bu rotada ilerliyor, completed → Gönüllü hedefe ulaştı

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_routes_path_gist", "path", postgresql_using="gist"), # LINESTRING da bir coğrafi veri, GIST index gerekiyor. "Bu bölgeden geçen rotaları getir" gibi sorgular hızlanır.

    )
