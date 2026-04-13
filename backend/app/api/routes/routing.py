"""
Rota Endpoint'leri
POST /routes/calculate  — Rota hesapla ve kaydet
GET  /routes/{id}       — Kaydedilen rotayı getir
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.db import get_db
from app.crud.route import get_route_by_id
from app.logic.routing_logic import calculate_and_save_route
from app.schemas.route import RouteCalculateRequest, RouteResponse

router = APIRouter()


@router.post("/calculate", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def calculate_route(
    payload: RouteCalculateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Başlangıç ve bitiş koordinatlarını alır, OSRM üzerinden rota hesaplar.
    Rotadaki hasarlı yolları dikkate alarak en güvenli güzergahı seçer ve kaydeder.
    """
    try:
        saved_route, coords, steps = await calculate_and_save_route(
            db=db,
            start_lat=payload.start_lat,
            start_lng=payload.start_lng,
            end_lat=payload.end_lat,
            end_lng=payload.end_lng,
            volunteer_id=payload.volunteer_id,
            request_id=payload.request_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Rota hesaplanamadı: {str(e)}")

    return RouteResponse(
        id=saved_route.id,
        volunteer_id=saved_route.volunteer_id,
        request_id=saved_route.request_id,
        coordinates=coords,
        steps=steps,
        duration_seconds=saved_route.duration_seconds,
        distance_meters=saved_route.distance_meters,
        risk_score=saved_route.risk_score,
        status=saved_route.status,
        created_at=saved_route.created_at,
    )


@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(
    route_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Kaydedilen rotayı getirir. Mobil uygulama bu endpoint ile rotayı haritada çizer.
    """
    result = await get_route_by_id(db, route_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rota bulunamadı")

    route, coords = result

    return RouteResponse(
        id=route.id,
        volunteer_id=route.volunteer_id,
        request_id=route.request_id,
        coordinates=coords,
        duration_seconds=route.duration_seconds,
        distance_meters=route.distance_meters,
        risk_score=route.risk_score,
        status=route.status,
        created_at=route.created_at,
    )
