from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_tc(db: AsyncSession, tc_no: str) -> User | None:
    result = await db.execute(select(User).where(User.tc_no == tc_no))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    email: str,
    password_hash: str = "",
    phone: str | None = None,
    tc_no: str | None = None,
    full_name: str | None = None,
    city: str | None = None,
    role: str = "citizen",
) -> User:
    user = User(
        email=email,
        password_hash=password_hash,
        phone=phone,
        tc_no=tc_no,
        full_name=full_name,
        city=city,
        role=role,
    )
    db.add(user)
    await db.flush()  # ID'yi hemen al, commit'i get_db yönetir
    return user
