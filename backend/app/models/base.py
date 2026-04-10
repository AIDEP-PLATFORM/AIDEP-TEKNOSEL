from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Tüm SQLAlchemy modelleri bu sınıftan türer."""
    pass
