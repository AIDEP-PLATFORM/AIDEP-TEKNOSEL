from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.authentication.jwt import create_access_token, create_refresh_token, verify_token
from app.core.security import hash_password, verify_password
from app.crud.user import create_user, get_user_by_email, get_user_by_id, get_user_by_tc
from app.crud.volunteer import create_volunteer
from app.models.user import User
from app.schemas.token import RefreshRequest, TokenResponse
from app.schemas.user import UserLogin, UserRegister, UserResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    if await get_user_by_email(db, body.email) or await get_user_by_tc(db, body.tc_no):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu email veya TC numarası zaten kayıtlı")

    user = await create_user(
        db,
        email=body.email,
        password_hash=hash_password(body.password),
        phone=body.phone,
        tc_no=body.tc_no,
        full_name=body.full_name,
        city=body.city,
        role=body.role,
    )

    if user.role == "volunteer":
        await create_volunteer(db, user.id)

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, body.email)
    if not user or not user.password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email veya şifre hatalı")

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email veya şifre hatalı")

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = verify_token(body.refresh_token, expected_type="refresh")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz refresh token")

    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")

    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
