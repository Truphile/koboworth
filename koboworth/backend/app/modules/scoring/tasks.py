
import asyncio
from sqlalchemy.future import select
from app.shared.db.session import AsyncSessionLocal
from app.modules.scoring.models.trust_score import TrustScore
from app.modules.worker.models.worker import InformalWorker
from .engine import calculate_ajo_score, calculate_composite_score, classify_tier
from app.modules.notifications.service import notify_tier_milestone
import uuid

async def _recalculate_score_async(worker_id: uuid.UUID):
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(InformalWorker).where(InformalWorker.id == worker_id))
        worker = res.scalar_one_or_none()
        if not worker: return
        
        # F27, F32, F33
        ajo = calculate_ajo_score(10, 1.0) 
        sub_scores = {"ajo": ajo, "catch_up": 15.0}
        composite = int(calculate_composite_score(sub_scores))
        new_tier = classify_tier(composite, 10, False)
        
        # F35: Score writer
        res = await db.execute(select(TrustScore).where(TrustScore.worker_id == worker_id))
        ts = res.scalar_one_or_none()
        old_tier = ts.tier if ts else "NONE"
        
        if not ts:
            ts = TrustScore(worker_id=worker_id, composite_score=composite, tier=new_tier)
            db.add(ts)
            
        ts.composite_score = composite
        ts.tier = new_tier
        ts.sub_scores = sub_scores
        await db.commit()
        
        # F36: Tier change detector
        if old_tier != new_tier and new_tier != "NONE":
            await notify_tier_milestone(worker.phone_number, new_tier)

# @celery_app.task
def recalculate_score(worker_id: str):
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    import uuid
    loop.run_until_complete(_recalculate_score_async(uuid.UUID(worker_id)))
