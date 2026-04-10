import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # --- Kimlik Bilgileri ---
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    tc_no = Column(String(11), unique=True, nullable=False)         # TC Kimlik Numarası (11 hane)
    full_name = Column(String(255), nullable=False)                 # Ad Soyad
    city = Column(String(100), nullable=True)                       # Yaşadığı şehir/ilçe (opsiyonel)
    hashed_password = Column(String(255), nullable=False)           # Ham şifre ASLA saklanmaz, bcrypt hash buraya

    # --- Sistem Bilgileri ---
    role = Column(String(50), nullable=False, default="volunteer")  # citizen | volunteer | ngo | admin
    is_active = Column(Boolean, nullable=False, default=True)
    organization = Column(String(255), nullable=True)               # NGO/admin için bağlı kurum

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_users_role", "role"),
        Index("ix_users_tc_no", "tc_no"),
    )
