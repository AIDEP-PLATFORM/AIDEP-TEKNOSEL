from typing import Any, Generic, TypeVar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import Base
M = TypeVar("M", bound=Base)
class CRUDBase(Generic[M]):
    def __init__(self, model: type[M]): self.model = model
    async def get(self, db: AsyncSession, id: Any) -> M | None:
        return await db.get(self.model, id)
    async def get_multi(self, db: AsyncSession, skip=0, limit=20) -> list[M]:
        r = await db.execute(select(self.model).offset(skip).limit(limit))
        return r.scalars().all()
    async def create(self, db: AsyncSession, obj: M) -> M:
        db.add(obj); await db.flush(); await db.refresh(obj); return obj
    async def delete(self, db: AsyncSession, obj: M) -> None:
        await db.delete(obj); await db.flush()
