import uuid
from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False, default="citizen")  # citizen → Yardım talep eden vatandaş, volunteer → Sahaya çıkan gönüllü, ngo → Yardım kuruluşu, admin → Sistem yöneticisi
    organization = Column(String(255), nullable=True) # Kullanıcının bağlı olduğu kurum. NGO ve admin için dolu olur. Vatandaş ve gönüllüler için boş kalabilir.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_users_role", "role"), # Tüm gönüllüleri getir" veya "tüm adminleri getir" gibi role göre sorgular hızlanır. Gönüllü atama algoritması bunu sık kullanacak.

    )
