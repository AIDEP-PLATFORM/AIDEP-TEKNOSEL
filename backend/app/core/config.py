from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = "postgresql+asyncpg://aidep:pass@postgres:5432/aidep_db"
    redis_url: str = "redis://redis:6379/0"
    osrm_url: str = "http://osrm:5000"
    ai_service_url: str = "http://ai:8001"    # YOLOv8m + XGBoost (AI-011, AI-012)
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = ""
    minio_secret_key: str = ""
    minio_secure: bool = False
    firebase_credentials_path: str = "/secrets/firebase-service-account.json"
    secret_key: str = "change-me"
    afad_api_key: str = ""
    model_config = SettingsConfigDict(env_file="../docker/.env.dev", extra="ignore")
settings = Settings()
