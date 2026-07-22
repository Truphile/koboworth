
from sqlalchemy.future import select
from app.shared.db.session import AsyncSessionLocal
from app.modules.passport.models.trust_passport import TrustPassport
from .generator import generate_passport_code, generate_pdf, generate_qr, upload_to_s3
import uuid

async def _reissue_passport_async(worker_id: uuid.UUID, new_tier: str):
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(TrustPassport).where(
            TrustPassport.worker_id == worker_id, 
            TrustPassport.is_active == True
        ))
        old_tp = res.scalar_one_or_none()
        if old_tp:
            old_tp.is_active = False
            
        code = generate_passport_code()
        pdf_bytes = generate_pdf("<html>New Passport</html>")
        qr_bytes = generate_qr(code)
        urls = upload_to_s3(pdf_bytes, qr_bytes, code)
        
        new_tp = TrustPassport(
            worker_id=worker_id,
            passport_code=code,
            # using mock fields due to base model constraints, typically we define tier
            # tier=new_tier,
            # pdf_url=urls['pdf'],
            # qr_url=urls['qr'],
            is_active=True
        )
        db.add(new_tp)
        await db.commit()

# @celery_app.task
def reissue_passport(worker_id: str, new_tier: str):
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    loop.run_until_complete(_reissue_passport_async(uuid.UUID(worker_id), new_tier))
