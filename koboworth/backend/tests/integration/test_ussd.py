import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.modules.collector.models.collector import AjoCollector
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_ussd_session_new(db_session, redis_client):
    collector = AjoCollector(
        phone_number="+2348012345678",
        name="Test Collector",
        pin_hash=get_password_hash("1234")
    )
    db_session.add(collector)
    await db_session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/ussd/session", data={
            "sessionId": "test_session_1",
            "phoneNumber": "+2348012345678",
            "networkCode": "01",
            "serviceCode": "*347#",
            "text": ""
        })
    assert response.status_code == 200
    assert response.text.startswith("CON Welcome to Koboworth")

@pytest.mark.asyncio
async def test_ussd_pin_lockout(db_session, redis_client):
    collector = AjoCollector(
        phone_number="+2348099999999",
        name="Lockout Collector",
        pin_hash=get_password_hash("1234")
    )
    db_session.add(collector)
    await db_session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 3 Failed attempts
        for i in range(3):
            res = await ac.post("/ussd/session", data={
                "sessionId": f"test_session_fail_{i}",
                "phoneNumber": "+2348099999999",
                "networkCode": "01",
                "serviceCode": "*347#",
                "text": "9999" # wrong PIN
            })
            assert "END" in res.text or "CON" in res.text
            
        # 4th time should be locked out
        response = await ac.post("/ussd/session", data={
            "sessionId": "test_session_locked",
            "phoneNumber": "+2348099999999",
            "networkCode": "01",
            "serviceCode": "*347#",
            "text": ""
        })
    assert response.status_code == 200
    assert "END Your account is locked" in response.text
