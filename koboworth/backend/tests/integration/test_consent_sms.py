import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.modules.worker.models.worker import InformalWorker
from app.modules.consent.models.consent_log import ConsentLog
from app.modules.consent.service import check_consent_status, check_lender_consent
import uuid
from sqlalchemy.future import select

@pytest.mark.asyncio
async def test_inbound_sms_yes(db_session):
    worker = InformalWorker(
        phone_number="+2348000000001",
        first_name="Test",
        last_name="Worker"
    )
    db_session.add(worker)
    await db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/consent/sms/inbound", data={
            "from": "+2348000000001",
            "text": "YES"
        })
    assert res.status_code == 200
    assert res.json() == {"status": "processed"}
    
    status = await check_consent_status(db_session, worker.id)
    assert status == "CONSENT_GRANTED"

@pytest.mark.asyncio
async def test_inbound_sms_block_revokes_lender(db_session):
    worker = InformalWorker(
        phone_number="+2348000000002",
        first_name="Block",
        last_name="Worker"
    )
    db_session.add(worker)
    await db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/consent/sms/inbound", data={
            "from": "+2348000000002",
            "text": "BLOCK"
        })
        
    assert res.status_code == 200
    status = await check_consent_status(db_session, worker.id)
    assert status == "LENDER_ACCESS_REVOKED"
    
@pytest.mark.asyncio
async def test_per_lender_consent(db_session):
    worker = InformalWorker(phone_number="+2348000000003", first_name="Lender", last_name="Worker")
    db_session.add(worker)
    await db_session.commit()
    
    lender_id = uuid.uuid4()
    
    # Grant access
    log1 = ConsentLog(worker_id=worker.id, event_type="LENDER_ACCESS_GRANTED", details={"lender_id": str(lender_id)})
    db_session.add(log1)
    await db_session.commit()
    
    has_access = await check_lender_consent(db_session, worker.id, lender_id)
    assert has_access == True
    
    # Revoke access
    log2 = ConsentLog(worker_id=worker.id, event_type="LENDER_ACCESS_REVOKED", details={"lender_id": str(lender_id)})
    db_session.add(log2)
    await db_session.commit()
    
    has_access = await check_lender_consent(db_session, worker.id, lender_id)
    assert has_access == False
