# Deprem sonrası vatandaşların sisteme gönderdiği yardım taleplerini tutuyor.
import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from app.models.base import Base

class Request(Base):
    __tablename__ = "requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True) 
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) # Her talep bir kullanıcıya ait olmak zorunda. Kullanıcı silinirse talepleri de silinir.
    
    location = Column(Geography(geometry_type='POINT', srid=4326, spatial_index=False), nullable=False) # Yardım istenen konum. Zorunlu çünkü nerede yardım gerektiği bilinmeden gönüllü ataması yapılamaz.
    
    xgboost_score = Column(Float, nullable=True) # XGBoost modelinin bu talebe verdiği öncelik puanı. 0-100 arası. Yüksek puan → daha acil. Talep ilk oluşturulduğunda NULL, AI servisi analiz edince buraya yazılır. Bu puana göre gönüllüler öncelikli taleplere yönlendirilir.
    status = Column(String(50), nullable=False, default="pending")  # Talebin hangi aşamada olduğu: pending → Talep geldi, henüz gönüllü atanmadı, assigned → Gönüllü atandı, yola çıktı, resolved → Yardım ulaştı, talep kapandı
    urgency = Column(String(50), nullable=True)  # Kullanıcının kendi belirttiği aciliyet seviyesi. xgboost_score'dan farkı şu — bu kullanıcının beyanı, XGBoost ise fotoğraf ve konum verilerine bakarak sistemin hesapladığı puan. İkisi birlikte değerlendirilir.
    needs = Column(String, nullable=True) # Kullanıcının serbest metin olarak yazdığı ihtiyaç açıklaması. Örnek: "Enkaz altında 2 kişi var, arama kurtarma ekibi lazım". Zorunlu değil, kullanıcı doldurmayabilir.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_requests_status", "status"), #  index'i → "Tüm pending talepleri getir" sorgusu hızlanır. Gönüllü atama algoritması bunu sürekli çalıştıracak
        Index("ix_requests_location_gist", "location", postgresql_using="gist"), # GIST index'i → "Şu gönüllüye en yakın talepleri getir" sorgusu hızlanır. Greedy algoritması bunu kullanacak
    )
