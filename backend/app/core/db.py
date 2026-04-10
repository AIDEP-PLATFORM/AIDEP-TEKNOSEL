from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.models.base import Base

async_engine = create_async_engine(
    settings.DATABASE_URL_ASYNC,
    echo=settings.DEBUG, # DEBUG açıksa her SQL sorgusunu terminale yazar
    poolclass=NullPool, # SQLAlchemy'nin kendi bağlantı havuzunu kapatır. Supabase zaten kendi havuzunu yönetiyor (pgBouncer), ikisi çakışınca DuplicatePreparedStatementError hatası çıkıyor. NullPool bunu önler
    connect_args={"ssl": "require", "statement_cache_size": 0}, #Supabase SSL zorunlu kılar, şifresiz bağlantıyı reddeder
)


AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False, # Commit sonrası nesneler hâlâ kullanılabilir kalır. True olsaydı commit sonrası bir objeye erişmek tekrar DB'ye sorgu atacaktı, gereksiz yük
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
