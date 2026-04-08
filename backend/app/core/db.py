from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings
engine = create_async_engine(settings.database_url, pool_size=10, max_overflow=20,
                              echo=settings.environment == "development")
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
class Base(DeclarativeBase): pass
