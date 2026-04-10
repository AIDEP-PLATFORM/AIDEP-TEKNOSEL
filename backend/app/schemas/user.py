from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# 1. TEMEL MODEL (Okuma ve genel işlemler için, şifre içermez)
class UserBase(BaseModel):
    email: EmailStr
    phone: str = Field(..., pattern=r"^\+?[\d\s\-]{10,15}$", description="Telefon numarası (zorunlu)")
    tc_no: str = Field(..., pattern=r"^\d{11}$", description="11 haneli TC Kimlik Numarası (zorunlu)")
    full_name: str = Field(..., min_length=2, description="Ad Soyad (zorunlu)")
    city: Optional[str] = Field(None, description="Yaşadığı şehir/ilçe (opsiyonel)")
    role: str = "volunteer"
    is_active: bool = True

# 2. YENİ KAYIT MODELİ (Kullanıcı sisteme kayıt olurken gönderilecek veriler)
class UserCreate(UserBase):
    # Şifre min 8 karakter: en az 1 harf + 1 rakam içermeli (regex ile kontrol)
    password: str = Field(
        ...,
        min_length=8,
        description="En az 8 karakterli şifre (zorunlu)"
    )

# 3. API CEVAPLANIRKEN kullanıcıya geri gönderilen model (şifre HİÇBİR ZAMAN dışarı çıkmaz!)
class UserRead(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    tc_no: str
    city: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True  # SQLAlchemy ORM nesnelerinden doğrudan okuyabilsin

# 4. KONUM / DURUM GÜNCELLEME MODELİ (Mobil uygulamadan anlık ping gelirken)
class UserUpdate(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None  # Örn: "available", "on_mission", "resting"