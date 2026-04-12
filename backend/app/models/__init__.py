# Alembic için:
from app.models.base import Base
from app.models.user import User
from app.models.request import Request
from app.models.damage_report import DamageReport
from app.models.volunteer import Volunteer
from app.models.route import Route
from app.models.earthquake import Earthquake
from app.models.audit_log import AuditLog
from app.models.team import Team

# Import all models here so Alembic autogenerate can detect them
__all__ = [
    "Base",
    "User",
    "Request",
    "DamageReport",
    "Volunteer",
    "Team",
    "Route",
    "Earthquake",
    "AuditLog",
]
