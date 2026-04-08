# YOLOv8m detect endpoint testleri — Issue AI-015
import base64, pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac: yield ac

@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_detect_invalid_base64(client):
    r = await client.post("/detect", json={"image_base64":"GECERSIZ!!!","location":{"lat":37.57,"lng":36.93}})
    assert r.status_code == 422
