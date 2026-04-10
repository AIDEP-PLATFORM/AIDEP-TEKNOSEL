"""AIDEP AI Servisi — YOLOv8s + XGBoost Inference"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.models.yolo_model import YOLOModel
from app.models.xgboost_model import XGBoostModel
from app.config import YOLO_PATH, XGBOOST_PATH


class State:
    yolo: YOLOModel | None = None
    xgb:  XGBoostModel | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Model yükleme I/O-bound (disk okuma) → ikisi paralel başlatılır
    State.yolo, State.xgb = await asyncio.gather(
        asyncio.to_thread(YOLOModel, YOLO_PATH),
        asyncio.to_thread(XGBoostModel, XGBOOST_PATH),
    )
    yield


app = FastAPI(
    title="AIDEP AI Servisi",
    version="1.0.0",
    description="YOLOv8s hasar tespiti + XGBoost önceliklendirme | Teknosel 2026",
    lifespan=lifespan,
)

from app.routers import health, detect, prioritize
app.include_router(health.router,     tags=["health"])
app.include_router(detect.router,     tags=["detect"])
app.include_router(prioritize.router, tags=["prioritize"])
