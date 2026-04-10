# User tablosunun gönüllüye özgü ek bilgilerini tutuyor. Her gönüllü aynı zamanda users tablosunda da var.
import uuid
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from app.models.base import Base

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    skills = Column(ARRAY(String), nullable=False, default=[]) # ARRAY(String) → PostgreSQL'e özgü dizi tipi. Tek kolonda birden fazla değer tutulur, default=[] → Başlangıçta boş liste, gönüllü sonradan becerilerini ekler, Greedy algoritması gönüllü atarken "arama kurtarma bilen gönüllüleri getir" diye bu kolona bakacak
    
    current_location = Column(Geography(geometry_type='POINT', srid=4326, spatial_index=False), nullable=True) #Gönüllünün anlık veya son bilinen konumu. nullable=True
    
    is_available = Column(Boolean, nullable=False, default=True) # Gönüllü şu an görev alabilir mi? True/False. Greedy algoritması sadece True olanları değerlendirir
    status = Column(String(50), nullable=False, default="active") # status → Gönüllünün genel durumu, active → Sistemde aktif, görev alabilir, on_mission → Şu an bir görevde, inactive → Sistemden ayrılmış
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_volunteers_availability", "is_available"), #index'i → "Müsait gönüllüleri getir" sorgusu hızlanır. Greedy algoritması bunu sürekli kullanacak
        Index("ix_volunteers_location_gist", "current_location", postgresql_using="gist"), # GIST index'i → "Talebe en yakın gönüllüyü bul" sorgusu hızlanır
    )
