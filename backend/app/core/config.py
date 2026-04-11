from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings): # Bu BaseSettings .env dosyasını ve sistem ortam değişkenlerini otomatik okur.
    model_config = SettingsConfigDict(
        env_file=".env",  # Burada env dosyasını oku diyoruz.
        env_file_encoding="utf-8",
        case_sensitive=True, # .env deki değişkenle birebir aynı olmalı. Büyük küçük harf duyarlı.
        extra="ignore",  # .env'de fazla değişken olsa hata vermez
    )

    # --- Uygulama ---
    PROJECT_NAME: str = "AIDEP"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True # SQLAlchemy çalıştırdığı SQL sorgularını terminale yazar.
    ENVIRONMENT: str = "development"  # development, test, production

    # --- CORS ---
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # --- Supabase ---
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # --- Veritabanı (Supabase: Transaction pooler veya doğrudan; Alembic için env.py 5432 kullanır) ---
    DATABASE_URL: str = ""

    def _normalized_database_url(self) -> str:
        u = self.DATABASE_URL
        if u.startswith("postgres://"):
            return u.replace("postgres://", "postgresql://", 1)
        return u

    @property
    def DATABASE_URL_ASYNC(self) -> str:
        u = self._normalized_database_url()
        return u.replace("postgresql://", "postgresql+asyncpg://", 1)

    @property
    def DATABASE_URL_SYNC(self) -> str:
        u = self._normalized_database_url()
        return u.replace("postgresql://", "postgresql+psycopg2://", 1)

    # --- Redis ---
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # --- JWT / Auth ---
    SECRET_KEY: str = "change-me-in-production"  # Auth issue'sunda zorunlu hale getirilecek
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 gün
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- OSRM ---
    osrm_url: str = "http://osrm:5000"

    # --- AI Service ---
    ai_service_url: str = "http://ai:8001"

    # --- Supabase Storage ---
    supabase_storage_bucket: str = "damage-photos"

    # --- MinIO ---
    MINIO_ENDPOINT: str = "minio:9000"        # Docker içinde minio:9000, dışarıdan localhost:9000
    MINIO_ACCESS_KEY: str = "aidep_minio"     # MinIO root kullanıcı (login için)
    MINIO_SECRET_KEY: str = ""                # MinIO root şifre
    MINIO_API_ACCESS_KEY: str = ""            # Programatik erişim key'i
    MINIO_API_SECRET_KEY: str = ""            # Programatik erişim secret'ı
    MINIO_BUCKET_PHOTOS: str = "aidep-photos" # Hasar fotoğrafları bucket'ı

    # --- AFAD ---
    afad_api_key: str = ""


settings = Settings()
