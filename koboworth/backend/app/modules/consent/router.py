from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.shared.db.session import get_db
from .service import append_consent_log
from app.modules.worker.models.worker import InformalWorker

router = APIRouter()

@router.post("/sms/inbound")
async def inbound_sms(request: Request, db: AsyncSession = Depends(get_db)):
    form = await request.form()
    sender = form.get("from", "")
    text = form.get("text", "").strip().upper()
    
    res = await db.execute(select(InformalWorker).where(InformalWorker.phone_number == sender))
    worker = res.scalar_one_or_none()
    if not worker:
        return {"status": "ignored"}
        
    if text == "YES":
        await append_consent_log(db, worker.id, "CONSENT_GRANTED")
    elif text == "NO":
        await append_consent_log(db, worker.id, "CONSENT_DENIED")
    elif text.startswith("BLOCK"):
        await append_consent_log(db, worker.id, "LENDER_ACCESS_REVOKED", details={"reason": "SMS_BLOCK_COMMAND"})
    elif text == "INFO":
        pass
        
    return {"status": "processed"}
