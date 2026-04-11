import uuid
from io import BytesIO

from minio import Minio
from minio.error import S3Error

from app.core.config import settings

_minio_client: Minio | None = None


def get_minio_client() -> Minio:
    """Singleton MinIO client döner. Programatik API key'leri kullanır."""
    global _minio_client
    if _minio_client is None:
        endpoint = settings.MINIO_ENDPOINT.replace("http://", "").replace("https://", "")
        _minio_client = Minio(
            endpoint,
            access_key=settings.MINIO_API_ACCESS_KEY,
            secret_key=settings.MINIO_API_SECRET_KEY,
            secure=False,  # Local geliştirmede SSL yok
        )
    return _minio_client


def ensure_bucket_exists(bucket_name: str) -> None:
    """Bucket yoksa oluşturur."""
    client = get_minio_client()
    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)


async def upload_photo(file_bytes: bytes, content_type: str = "image/jpeg") -> str:
    """
    Fotoğrafı MinIO'daki aidep-photos bucket'ına yükler.
    Dosya adı UUID ile üretilir, çakışma olmaz.
    URL olarak döner.
    """
    client = get_minio_client()
    bucket = settings.MINIO_BUCKET_PHOTOS
    ensure_bucket_exists(bucket)

    file_name = f"damage-photos/{uuid.uuid4()}.jpg"
    file_size = len(file_bytes)

    client.put_object(
        bucket_name=bucket,
        object_name=file_name,
        data=BytesIO(file_bytes),
        length=file_size,
        content_type=content_type,
    )

    return f"http://{settings.MINIO_ENDPOINT}/{bucket}/{file_name}"
