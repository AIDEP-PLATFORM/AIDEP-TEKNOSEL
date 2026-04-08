from fastapi import APIRouter
from app.main import State
router = APIRouter()
@router.get("/health")
async def health():
    return {"status":"ok",
            "yolo_loaded":    State.yolo.loaded if State.yolo else False,
            "xgboost_loaded": State.xgb.loaded  if State.xgb  else False,
            "version": "1.0.0"}
