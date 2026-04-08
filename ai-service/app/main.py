"""AIDEP AI Servisi — YOLOv8m + XGBoost Inference"""
import os
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
    State.yolo = YOLOModel(YOLO_PATH)
    State.xgb  = XGBoostModel(XGBOOST_PATH)
    yield


app = FastAPI(
    title="AIDEP AI Servisi",
    version="1.0.0",
    description="YOLOv8m hasar tespiti + XGBoost önceliklendirme | Teknosel 2026",
    lifespan=lifespan,
)

from app.routers import health, detect, prioritize
app.include_router(health.router,     tags=["health"])
app.include_router(detect.router,     tags=["detect"])
app.include_router(prioritize.router, tags=["prioritize"])
