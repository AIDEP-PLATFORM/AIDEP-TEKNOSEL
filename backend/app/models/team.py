"""
Ekip modeli — STK bünyesindeki 10'ar kişilik gönüllü ekipleri
"""
import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from app.models.base import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    name = Column(String(255), nullable=False)               # "Kızılay Ekip-1"
    organization = Column(String(255), nullable=False)       # "Kızılay"
    max_size = Column(Integer, nullable=False, default=10)   # Maksimum üye sayısı

    # Ekibin anlık konumu (lider cihazından güncellenir)
    current_location = Column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False),
        nullable=True,
    )

    status = Column(String(50), nullable=False, default="available")
    # available   → Müsait, görev bekliyor
    # on_mission  → Görevde, bir hedefe yönlendirilmiş
    # inactive    → Pasif

    # Şu an atandığı hasar raporu (nullable — görev yoksa NULL)
    assigned_damage_id = Column(
        UUID(as_uuid=True),
        ForeignKey("damage_reports.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_teams_status", "status"),
        Index("ix_teams_organization", "organization"),
        Index("ix_teams_location_gist", "current_location", postgresql_using="gist"),
    )
