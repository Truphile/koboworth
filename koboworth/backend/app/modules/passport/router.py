
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.shared.db.session import get_db
from app.modules.passport.models.trust_passport import TrustPassport

router = APIRouter()

@router.get("/verify/{passport_code}")
async def verify_passport(passport_code: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(TrustPassport).where(TrustPassport.passport_code == passport_code))
    tp = res.scalar_one_or_none()
    if not tp:
        raise HTTPException(status_code=404, detail="Passport not found")
        
    if not tp.is_active:
        return {"status": "inactive", "message": "This passport has been deactivated or superseded."}
        
    return {"status": "active", "worker_id": str(tp.worker_id)}
