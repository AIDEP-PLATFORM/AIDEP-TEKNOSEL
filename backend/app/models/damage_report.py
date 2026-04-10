# Kullanıcıların deprem sonrası fotoğraf çekip gönderdiği hasar raporlarını tutuyor. YOLOv8 bu fotoğrafları analiz edip sonuçları buraya yazıyor.
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB # JSONB → PostgreSQL'e özgü JSON tipi. Normal JSON'dan farkı içeriği binary olarak saklar, bu sayede JSON içinde arama yapılabilir ve daha hızlı çalışır. YOLO'nun analiz sonuçları buraya kaydedilecek
from sqlalchemy.sql import func
from geoalchemy2 import Geography # Coğrafi konum verisi saklamak için. Normal Float ile enlem/boylam tutmak yerine PostGIS'in Geography tipini kullanıyoruz — mesafe hesaplama, yakındaki noktaları bulma gibi işlemler çok daha kolay oluyor.
from app.models.base import Base

class DamageReport(Base):
    __tablename__ = "damage_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) # ondelete="CASCADE" → Kullanıcı silinirse onun tüm hasar raporları da silinir. AuditLog'dan farklı — orada SET NULL vardı çünkü logları korumak istiyorduk. Burada kullanıcısız hasar raporu anlamsız.
    
    location = Column(Geography(geometry_type='POINT', srid=4326, spatial_index=False), nullable=False) #geometry_type='POINT' → Tek bir nokta koordinatı, enlem ve boylam, srid=4326 → Dünya standardı koordinat sistemi. Google Maps, GPS hepsi bunu kullanır,  GeoAlchemy2 otomatik GIST index oluşturmasın, biz aşağıda __table_args__'da elle tanımlıyoruz, nullable=False → Konum zorunlu, nerede hasar olduğu bilinmeden rapor kabul edilmez
    photo_url = Column(String, nullable=False)
    
    analysis_results = Column(JSONB, nullable=True) # YOLOv8'in analiz sonuçları buraya yazılıyor. 
    status = Column(String(50), nullable=False, default="analyzing") # Raporun hangi aşamada olduğunu gösterir: analyzing → Fotoğraf yeni geldi, YOLOv8 analiz ediyor, verified → Analiz tamamlandı, doğrulandı, rejected → Geçersiz fotoğraf, reddedildi
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_damage_reports_status", "status"), # index'i → "Tüm analyzing durumundaki raporları getir" gibi sorgular hızlanır
        Index("ix_damage_reports_location_gist", "location", postgresql_using="gist"), # GIST index'i → "Şu koordinata en yakın hasar raporlarını getir" gibi coğrafi sorgular hızlanır. postgresql_using="gist" PostGIS'in coğrafi veri için kullandığı özel index tipi
    )
