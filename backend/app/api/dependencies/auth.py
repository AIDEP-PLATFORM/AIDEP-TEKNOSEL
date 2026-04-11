from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.db import get_db
from app.core.supabase_client import get_supabase
from app.crud.user import create_user, get_user_by_email
from app.models.user import User

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Supabase token'ını doğrular.
    - Token geçerliyse Supabase'den email alır
    - Bizim DB'mizde kullanıcı varsa döner, yoksa otomatik oluşturur (ilk giriş sync)
    """
    try:
        supabase = get_supabase()
        response = supabase.auth.get_user(credentials.credentials)
        supabase_user = response.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if supabase_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")

    # DB'de var mı kontrol et, yoksa ilk girişte otomatik oluştur
    user = await get_user_by_email(db, supabase_user.email)
    if user is None:
        user = await create_user(
            db,
            email=supabase_user.email,
            password_hash="",   # Supabase şifreyi yönetiyor, biz saklamıyoruz
            phone="",
            tc_no="",
            full_name=supabase_user.user_metadata.get("full_name", ""),
        )

    return user
