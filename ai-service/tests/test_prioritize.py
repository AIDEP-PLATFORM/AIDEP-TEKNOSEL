# XGBoost prioritize endpoint testleri — Issue AI-015
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac: yield ac

@pytest.mark.asyncio
async def test_prioritize_empty(client):
    r = await client.post("/prioritize", json={"requests": []})
    assert r.status_code == 200 and r.json()["ranked_requests"] == []

@pytest.mark.asyncio
async def test_urgency_ordering(client):
    r = await client.post("/prioritize", json={"requests": [
        {"id":1,"urgency_level":1,"waiting_time_min":5,"distance_km":5,"need_type":"food","weather_score":0,"population":1,"damage_score":0},
        {"id":2,"urgency_level":5,"waiting_time_min":60,"distance_km":2,"need_type":"rescue","weather_score":30,"population":4,"damage_score":80},
    ]})
    assert r.status_code == 200
    assert r.json()["ranked_requests"][0]["id"] == 2  # Acil olan önce
