"""
POST /detect — YOLOv8m Hasar Tespiti
Issue: AI-011
"""
import base64, time
from io import BytesIO
from fastapi import APIRouter, HTTPException
from PIL import Image
from app.schemas import DetectRequest, DetectResponse, Detection
from app.main import State

router = APIRouter()

@router.post("/detect", response_model=DetectResponse)
async def detect(req: DetectRequest):
    t = time.time()
    try:
        img = Image.open(BytesIO(base64.b64decode(req.image_base64))).convert("RGB")
    except Exception:
        raise HTTPException(422, "Geçersiz base64 görüntü.")
    raw = State.yolo.predict(img, req.threshold)
    cls, sev = State.yolo.dominant(raw)
    return DetectResponse(
        detections=[Detection(**d) for d in raw if d["class_name"] != "pending"],
        damage_class=cls, severity=sev,
        processing_time_ms=(time.time()-t)*1000,
    )
