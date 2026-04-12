from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# 1. TEMEL MODEL (Okuma ve genel işlemler için, şifre içermez)
class UserBase(BaseModel):
    email: EmailStr
    phone: str = Field(..., pattern=r"^\+?[\d\s\-]{10,15}$", description="Telefon numarası (zorunlu)")
    tc_no: str = Field(..., pattern=r"^\d{11}$", description="11 haneli TC Kimlik Numarası (zorunlu)")
    full_name: str = Field(..., min_length=2, description="Ad Soyad (zorunlu)")
    city: Optional[str] = Field(None, description="Yaşadığı şehir/ilçe (opsiyonel)")
    organization: Optional[str] = Field(None, description="STK kurum adı (ngo rolü için)")
    role: str = "citizen"  # citizen | volunteer | ngo | admin
    is_active: bool = True


# 2. YENİ KAYIT MODELİ (Kullanıcı sisteme kayıt olurken gönderilecek veriler)
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="En az 8 karakterli şifre (zorunlu)")


# auth.py ile uyum için alias
UserRegister = UserCreate


# 3. GİRİŞ MODELİ
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# 4. API CEVABI (şifre HİÇBİR ZAMAN dışarı çıkmaz)
class UserRead(BaseModel):
    id: UUID
    email: str
    full_name: str
    phone: str
    tc_no: str
    city: Optional[str] = None
    role: str
    is_active: bool
    organization: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}  # SQLAlchemy ORM nesnelerinden doğrudan okuyabilsin


# auth.py ile uyum için alias
UserResponse = UserRead


# 5. GÜNCELLEME MODELİ
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    tc_no: Optional[str] = None
    organization: Optional[str] = None
    is_active: Optional[bool] = None
