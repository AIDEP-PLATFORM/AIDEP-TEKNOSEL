from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2.elements import WKTElement

from app.core.db import get_db
from app.core.security import hash_password
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.models.user import User
from app.models.volunteer import Volunteer

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
async def register_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Yeni kullanıcı kaydı oluşturur.
    - Email ve TC zaten sistemde varsa 409 Conflict hatası döner.
    - Şifre otomatik olarak bcrypt ile hashlenerek kaydedilir, ham şifre asla saklanmaz.
    """
    # 1. Email veya TC daha önce kayıtlı mı? Kontrol et.
    existing = await db.execute(
        select(User).where(
            (User.email == user_data.email) | (User.tc_no == user_data.tc_no)
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=409,
            detail="Bu email veya TC numarası zaten kayıtlı."
        )

    # 2. Şifreyi hashle — ham şifreyi DB'ye asla yazmıyoruz!
    hashed_pw = hash_password(user_data.password)

    # 3. Yeni User nesnesi oluştur ve kaydet
    new_user = User(
        email=user_data.email,
        phone=user_data.phone,
        tc_no=user_data.tc_no,
        full_name=user_data.full_name,
        city=user_data.city,
        role=user_data.role,
        is_active=user_data.is_active,
        hashed_password=hashed_pw,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.get("/volunteers", response_model=list[UserRead])
async def get_active_volunteers(db: AsyncSession = Depends(get_db)):
    """
    Sisteme kayıtlı, boşta olan (görev almaya müsait) tüm aktif gönüllüleri getirir.
    """
    query = select(Volunteer).where(Volunteer.is_available == True)
    result = await db.execute(query)
    volunteers = result.scalars().all()

    return volunteers


@router.put("/me/location")
async def update_my_location(location_data: UserUpdate, db: AsyncSession = Depends(get_db)):
    """
    Gönüllünün anlık konumunu ve durumunu günceller.
    PostGIS Geography formatını kullanarak günceller.
    """
    # Geliştirme aşamasında şimdilik sabit email üzerinden sorguluyoruz
    # İleride JWT token'dan user_id alınacak
    test_email = "test@test.com"

    # 1. Kullanıcının emailine göre Gönüllü kaydını bul (User ile JOIN ederek)
    query = (
        select(Volunteer)
        .join(User, Volunteer.user_id == User.id)
        .where(User.email == test_email)
    )
    result = await db.execute(query)
    volunteer = result.scalars().first()

    if not volunteer:
        raise HTTPException(
            status_code=404,
            detail="Belirtilen emaile ait gönüllü kaydı bulunamadı."
        )

    # 2. Koordinatlar geldi ise WKTElement (PostGIS) formatına çevirip kaydet
    if location_data.latitude is not None and location_data.longitude is not None:
        volunteer.current_location = WKTElement(
            f"POINT({location_data.longitude} {location_data.latitude})",
            srid=4326
        )

    # 3. Durum (status) geldiyse güncelle
    if location_data.status:
        volunteer.status = location_data.status

    await db.commit()

    return {"message": "Konum / durum başarıyla güncellendi."}