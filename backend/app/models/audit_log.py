# Bu tablo sistemde kim ne zaman ne yaptı bunların kaydını tutuyor. Bir çeşit sistem günlüğü.
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID # PostgreSQL'e özgü UUID tipi. as_uuid=True deyince Python'da uuid.UUID objesi olarak gelir, düz string değil.
from sqlalchemy.sql import func # SQL fonksiyonlarına erişim. func.now() ile veritabanının kendi saat fonksiyonu kullanılıyor.
from app.models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True) # ondelete="SET NULL" → Kullanıcı silinirse bu kayıt silinmez, user_id boş kalır. Yani log kayıtları korunur, kim yaptığı bilinmez olur
    
    action = Column(String(100), nullable=False)   # Yapılan işlem: create_request, delete_volunteer, sync_earthquake
    resource = Column(String(100), nullable=False) # İşlemin yapıldığı alan: request, volunteer, system
    details = Column(String, nullable=True) # İşleme ait ek bilgi: değişen alan, eski değer, vb. Zorunlu değil
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True) # server_default=func.now() → Kayıt eklendiği an veritabanı kendi saatini yazar. Python'a güvenmiyoruz çünkü sunucu saati yanlış olabilir
                                                                                       # timezone=True → Saat dilimi bilgisi de saklanır. Türkiye UTC+3, AFAD sunucusu farklı olabilir, karışıklık olmaz
                                                                                       #index=True → Tarihe göre sorgular hızlı çalışır. "Son 1 saatteki logları getir" gibi
