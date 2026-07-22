
def test_sentry_integration():
    try:
        import sentry_sdk
        assert True
    except ImportError:
        assert False

def test_prometheus_integration():
    from app.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.get("/metrics")
    assert response.status_code == 200

from fastapi.testclient import TestClient

def test_health_check():
    from app.main import app
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "db" in data
    assert "redis" in data
    assert "celery" in data
    assert "s3" in data
