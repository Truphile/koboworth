from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.consent.models.consent_log import ConsentLog
from uuid import UUID

async def append_consent_log(db: AsyncSession, worker_id: UUID, event_type: str, details: dict = None, channel: str = "SMS"):
    log = ConsentLog(worker_id=worker_id, event_type=event_type, details=details or {}, channel=channel)
    db.add(log)
    await db.commit()

async def check_consent_status(db: AsyncSession, worker_id: UUID) -> str:
    stmt = select(ConsentLog).where(ConsentLog.worker_id == worker_id).order_by(ConsentLog.timestamp.desc()).limit(1)
    res = await db.execute(stmt)
    latest = res.scalar_one_or_none()
    return latest.event_type if latest else "UNCONSENTED"

async def check_lender_consent(db: AsyncSession, worker_id: UUID, lender_id: UUID) -> bool:
    stmt = select(ConsentLog).where(
        ConsentLog.worker_id == worker_id,
        ConsentLog.event_type.in_(["LENDER_ACCESS_GRANTED", "LENDER_ACCESS_REVOKED"])
    ).order_by(ConsentLog.timestamp.desc())
    res = await db.execute(stmt)
    logs = res.scalars().all()
    for log in logs:
        if log.details and log.details.get("lender_id") == str(lender_id):
            return log.event_type == "LENDER_ACCESS_GRANTED"
    return False
