from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings

# Token içinde sakladığımız alanlar:
# sub  → kullanıcı ID'si (subject)
# email → kullanıcı emaili
# type → "access" veya "refresh"
# exp  → son geçerlilik tarihi (jose otomatik kontrol eder)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "type": "access", "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "type": "refresh", "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict[str, Any]:
    """Token'ı doğrular, geçerliyse payload'ı döner. Geçersizse ValueError fırlatır."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Geçersiz token: {e}")

    if payload.get("type") != expected_type:
        raise ValueError(f"Token tipi hatalı: beklenen {expected_type}")

    return payload
