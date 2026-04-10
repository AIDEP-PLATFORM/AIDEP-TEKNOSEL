def test_health_returns_json(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body.get("api") == "ok"
    assert "db (supabase)" in body
    assert "redis" in body
