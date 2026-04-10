"""REST API v1 — alt route modülleri burada birleştirilir."""
from fastapi import APIRouter

from app.api.routes import (
    auth,
    damage,
    earthquakes,
    exercises,
    matching,
    requests,
    routing,
    users,
    volunteers,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(earthquakes.router, prefix="/earthquakes", tags=["earthquakes"])
api_router.include_router(damage.router, prefix="/damage", tags=["damage"])
api_router.include_router(requests.router, prefix="/requests", tags=["requests"])
api_router.include_router(volunteers.router, prefix="/volunteers", tags=["volunteers"])
api_router.include_router(matching.router, prefix="/matching", tags=["matching"])
api_router.include_router(routing.router, prefix="/routing", tags=["routing"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
