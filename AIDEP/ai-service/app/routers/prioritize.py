"""
POST /prioritize — XGBoost Önceliklendirme
Issue: AI-012
"""
import time
from fastapi import APIRouter
from app.schemas import PrioritizeRequest, PrioritizeResponse, RankedItem
from app.main import State

router = APIRouter()

@router.post("/prioritize", response_model=PrioritizeResponse)
async def prioritize(req: PrioritizeRequest):
    t = time.time()
    if not req.requests:
        return PrioritizeResponse(ranked_requests=[], processing_time_ms=0)
    scores = State.xgb.predict([r.model_dump() for r in req.requests])
    ranked = sorted(zip([r.id for r in req.requests], scores), key=lambda x: x[1], reverse=True)
    return PrioritizeResponse(
        ranked_requests=[RankedItem(id=rid, priority_score=score, rank=i+1)
                         for i, (rid, score) in enumerate(ranked)],
        processing_time_ms=(time.time()-t)*1000,
    )
