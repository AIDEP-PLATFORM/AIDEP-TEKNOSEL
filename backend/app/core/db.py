from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
# pool_pre_ping=True → bağlantı kopmuşsa otomatik yeniden bağlanır
# echo=False → production'da SQL loglarını kapatır; DEBUG modunda açılabilir

async_engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
)

# ---------------------------------------------------------------------------
# Session Factory
# ---------------------------------------------------------------------------
# expire_on_commit=False → commit sonrası objeleri tekrar DB'den çekmez,
# async context'te lazy load çalışmadığı için bu önemli

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ---------------------------------------------------------------------------
# Base Model
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    """Tüm SQLAlchemy modelleri bu sınıftan türer."""
    pass


# ---------------------------------------------------------------------------
# Dependency — FastAPI route'larında kullanılır
# ---------------------------------------------------------------------------

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency injection için session üretir.
    Her request kendi session'ını alır, bittikten sonra otomatik kapatılır.

    Kullanım:
        @router.get("/")
        async def my_route(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
