from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """Giriş yapmış kullanıcının profil bilgilerini döner."""
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Giriş yapmış kullanıcının profil bilgilerini günceller (sadece gönderilen alanlar)."""
    update_data = body.model_dump(exclude_unset=True)  # Gönderilmeyen alanları atla
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.flush()
    return current_user
