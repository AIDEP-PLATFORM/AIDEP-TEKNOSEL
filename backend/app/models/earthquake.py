# AFAD, Kandilli ve USGS'den gelen deprem verilerini tutuyor.
import uuid
from sqlalchemy import Column, String, DateTime, Float, Integer, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from app.models.base import Base

class Earthquake(Base):
    __tablename__ = "earthquakes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    magnitude = Column(Float, nullable=False) # Depremin büyüklüğü. Örnek: 5.4. Zorunlu çünkü büyüklüğü bilinmeyen deprem kaydı anlamsız
    depth_km = Column(Float, nullable=True) # Depremin kaç km derinlikte olduğu. Derinlik can kaybını ve hasarı doğrudan etkiler — sığ depremler daha yıkıcı olur. nullable=True çünkü bazı kaynaklardan bu bilgi gelmeyebilir
    
    location = Column(Geography(geometry_type='POINT', srid=4326, spatial_index=False), nullable=False) # Depremin tam koordinatı. Zorunlu
    location_name = Column(String(255), nullable=True) # Okunabilir konum adı. Örnek: "İzmir, Bornova". Koordinattan otomatik üretilebilir ama her kaynaktan gelmeyebilir, bu yüzden nullable=True
    
    source = Column(String(100), nullable=False) # Veriyi kim gönderdi. Aynı deprem birden fazla kaynaktan gelebilir, hangisinin verisi olduğunu bilmek lazım. İleride "sadece AFAD verilerini göster" gibi filtreler için de kullanılır
    event_time = Column(DateTime(timezone=True), nullable=False) # Depremin gerçekte olduğu an. AFAD'dan gelen zaman damgası
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_earthquakes_event_time", "event_time"), # index'i → "Son 24 saatteki depremleri getir" gibi zaman bazlı sorgular hızlanır
        Index("ix_earthquakes_location_gist", "location", postgresql_using="gist"), # GIST index'i → "Şu şehre 100 km içindeki depremleri getir" gibi coğrafi sorgular hızlanır
    )
