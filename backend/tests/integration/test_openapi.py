"""Veritabanı gerektirmez — uygulama ayağa kalkıyor mu kontrol eder."""


def test_openapi_json(client):
    r = client.get("/openapi.json")
    assert r.status_code == 200
    assert "openapi" in r.json()


def test_docs_available(client):
    r = client.get("/docs")
    assert r.status_code == 200
