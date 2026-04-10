from passlib.context import CryptContext

# Bcrypt: endüstri standardı şifre hashleme algoritması.
# "deprecated=auto" → ileride algoritmayı güncellersek eski hashler otomatik işaretlenir.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Ham şifreyi bcrypt ile hashler. Veritabanına bu değer yazılır."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kullanıcının girdiği şifreyi DB'deki hash ile karşılaştırır. Login için kullanılır."""
    return pwd_context.verify(plain_password, hashed_password)
