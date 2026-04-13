"""
Damage Report Routes
POST /damage        — Fotoğraf yükle + rapor oluştur (MinIO + YOLO)
GET  /damage        — Raporları listele (harita için)
GET  /damage/{id}   — Tek rapor detayı
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.api.routes.websocket import ws_manager
from app.crud.damage_report import (
    create_damage_report,
    get_damage_report_by_id,
    get_damage_reports,
)
from app.models.user import User
from app.schemas.damage_report import DamageReportResponse, DamageReportListResponse
from app.services.ai_service import call_detect
from app.services.minio_service import upload_photo

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=DamageReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    lat: float = Form(..., ge=-90, le=90),
    lng: float = Form(..., ge=-180, le=180),
    description: Optional[str] = Form(None, max_length=1000),
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fotoğraf + konum alır, MinIO'ya yükler, YOLO analizi yapar, raporu kaydeder.
    """
    # Dosya tipi kontrolü
    if photo.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Desteklenen formatlar: jpeg, png, webp",
        )

    # Dosyayı oku
    file_bytes = await photo.read()

    # Boyut kontrolü
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Fotoğraf boyutu 10 MB'ı geçemez",
        )

    # MinIO'ya yükle
    try:
        photo_url = await upload_photo(file_bytes, content_type=photo.content_type or "image/jpeg")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Fotoğraf yüklenemedi: {str(e)}",
        )

    # AI servisi — hata olsa bile rapor kaydedilir
    ai_result = await call_detect(file_bytes, lat=lat, lng=lng)

    damage_class = None
    severity = None
    analysis_results = None

    if ai_result:
        damage_class = ai_result["damage_class"]
        severity = ai_result["severity"] if ai_result["severity"] > 0 else None
        analysis_results = ai_result["detections"]

    # Veritabanına kaydet
    report = await create_damage_report(
        db=db,
        user_id=current_user.id,
        photo_url=photo_url,
        lat=lat,
        lng=lng,
        description=description,
        damage_class=damage_class,
        severity=severity,
        analysis_results=analysis_results,
        status="verified" if ai_result else "analyzing",
    )

    response = _to_response(report, lat, lng)

    # Bağlı tüm STK panellerine gerçek zamanlı bildirim gönder
    await ws_manager.broadcast({
        "type": "new_damage",
        "data": {
            "id": str(response.id),
            "lat": response.lat,
            "lng": response.lng,
            "damage_class": response.damage_class,
            "severity": response.severity,
            "status": response.status,
            "description": response.description,
            "created_at": response.created_at.isoformat() if response.created_at else None,
        },
    })

    return response


@router.get("", response_model=DamageReportListResponse)
async def list_reports(
    skip: int = 0,
    limit: int = 50,
    severity_min: Optional[int] = None,
    report_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Hasar raporlarını listeler. Harita için kullanılır.
    severity_min=4 ile sadece ağır hasarlıları filtreleyebilirsin.
    """
    total, items = await get_damage_reports(
        db=db,
        skip=skip,
        limit=limit,
        severity_min=severity_min,
        status=report_status,
    )

    responses = []
    for item in items:
        lat, lng = _extract_coords(item)
        responses.append(_to_response(item, lat, lng))

    return DamageReportListResponse(total=total, items=responses)


@router.get("/{report_id}", response_model=DamageReportResponse)
async def get_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await get_damage_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rapor bulunamadı")

    lat, lng = _extract_coords(report)
    return _to_response(report, lat, lng)


# ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────

def _extract_coords(report) -> tuple[Optional[float], Optional[float]]:
    """
    GeoAlchemy2 Geography alanından lat/lng çıkarır.
    Konum POINT(lng lat) formatında saklanır.
    """
    try:
        if report.location is None:
            return None, None
        # WKT formatı: "POINT(lng lat)"
        from geoalchemy2.shape import to_shape
        point = to_shape(report.location)
        return point.y, point.x  # lat=y, lng=x
    except Exception:
        return None, None


def _to_response(report, lat, lng) -> DamageReportResponse:
    return DamageReportResponse(
        id=report.id,
        user_id=report.user_id,
        description=report.description,
        photo_url=report.photo_url,
        damage_class=report.damage_class,
        severity=report.severity,
        priority_score=report.priority_score,
        status=report.status,
        lat=lat,
        lng=lng,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )
