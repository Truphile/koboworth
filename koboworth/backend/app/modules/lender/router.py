
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.core.security import create_access_token, verify_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/token")

@router.post("/auth/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # We treat username as client_id and password as client_secret
    if form_data.username == "lender" and form_data.password == "demo-123":
        return {"access_token": create_access_token({"sub": form_data.username}), "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

def get_current_lender(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.shared.db.session import get_db
from app.modules.passport.models.trust_passport import TrustPassport
from app.modules.worker.models.worker import InformalWorker
from app.modules.scoring.models.trust_score import TrustScore
from app.modules.collector.models.group import AjoGroup, GroupMembership

@router.get("/passports/{code}")
async def get_passport(code: str, lender: str = Depends(get_current_lender), db: AsyncSession = Depends(get_db)):
    passport_res = await db.execute(select(TrustPassport).where(TrustPassport.code == code))
    passport = passport_res.scalars().first()
    if not passport or not passport.is_active:
        raise HTTPException(status_code=404, detail="Passport not found or inactive")
        
    worker_res = await db.execute(select(InformalWorker).where(InformalWorker.id == passport.worker_id))
    worker = worker_res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    score_res = await db.execute(select(TrustScore).where(TrustScore.worker_id == worker.id))
    trust_score = score_res.scalars().first()

    group_mem_res = await db.execute(select(GroupMembership).where(GroupMembership.worker_id == worker.id))
    membership = group_mem_res.scalars().first()
    group_name = "Not Assigned"
    if membership:
        grp_res = await db.execute(select(AjoGroup).where(AjoGroup.id == membership.group_id))
        group = grp_res.scalars().first()
        if group:
            group_name = group.name

    return {
        "worker_id": str(worker.id),
        "worker_name": f"{worker.first_name} {worker.last_name}",
        "ajo_group": group_name,
        "validity": passport.expires_at.strftime("%Y-%m-%d") if passport.expires_at else "No Expiry",
        "tier": trust_score.tier if trust_score else "UNRATED",
        "trust_score": trust_score.score if trust_score else 0,
        "max_loan": 50000 if trust_score and trust_score.tier == "GOLD" else (10000 if trust_score and trust_score.tier == "SILVER" else 0)
    }

class ScoreEventRequest(BaseModel):
    worker_id: str
    event_type: str

@router.post("/score-events")
async def report_score_event(req: ScoreEventRequest, lender: str = Depends(get_current_lender)):
    if req.event_type not in ["LOAN_REPAID", "LOAN_DEFAULTED"]:
        raise HTTPException(status_code=400, detail="Invalid event type")
    return {"status": "success", "message": f"Event {req.event_type} recorded for {req.worker_id}"}

@router.get("/usage")
async def get_usage(lender: str = Depends(get_current_lender)):
    return {"lender": lender, "queries_used": 10, "rate_limit_status": "OK"}
