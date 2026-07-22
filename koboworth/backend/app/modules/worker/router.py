from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, func
import uuid

from app.shared.db.session import get_db
from app.modules.worker.models.worker import InformalWorker
from app.modules.scoring.models.trust_score import TrustScore
from app.modules.collector.models.group import AjoGroup, GroupMembership
from app.modules.collector.models.collector import AjoCollector
from app.modules.worker.models.contribution import Contribution
from app.modules.passport.models.trust_passport import TrustPassport
import random
import string
from app.core.security import get_password_hash, verify_password

router = APIRouter()

class WorkerCreate(BaseModel):
    phone_number: str
    bvn: str
    nin: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

@router.post("")
@router.post("/")
async def create_worker(req: WorkerCreate, db: AsyncSession = Depends(get_db)):
    worker = InformalWorker(
        phone_number=req.phone_number,
        bvn=req.bvn,
        nin=req.nin,
        password_hash=get_password_hash(req.password),
        first_name=req.first_name,
        last_name=req.last_name
    )
    db.add(worker)
    try:
        await db.commit()
        await db.refresh(worker)

        # Create Trust Passport
        new_code = "TP-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        passport = TrustPassport(worker_id=worker.id, code=new_code)
        db.add(passport)
        await db.commit()

        # Send Welcome SMS
        from app.modules.notifications.worker import send_sms
        msg = f"Welcome to Koboworth, {worker.first_name or 'User'}! Your Trust Passport ({new_code}) is active. Start saving today to unlock credit!"
        send_sms.delay(worker.phone_number, msg)

        return {"status": "success", "worker_id": str(worker.id)}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Worker with this phone, BVN, or NIN already exists.")

@router.get("/phone/{phone_number}")
async def get_worker_by_phone(phone_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InformalWorker).where(InformalWorker.phone_number == phone_number))
    worker = result.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {
        "id": str(worker.id),
        "phone_number": worker.phone_number,
        "first_name": worker.first_name,
        "last_name": worker.last_name,
        "bvn": worker.bvn,
        "nin": worker.nin,
        "role": "WORKER"
    }

class WorkerLogin(BaseModel):
    phone_number: str
    password: str

@router.post("/login")
async def login_worker(req: WorkerLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InformalWorker).where(InformalWorker.phone_number == req.phone_number))
    worker = result.scalars().first()
    
    if not worker:
        raise HTTPException(status_code=400, detail="Invalid phone number or password")
        
    if not worker.password_hash or not verify_password(req.password, worker.password_hash):
        if worker.nin == req.password and not worker.password_hash:
            pass # Allow fallback for legacy test accounts
        else:
            raise HTTPException(status_code=400, detail="Invalid phone number or password")
            
    return {
        "id": str(worker.id),
        "phone_number": worker.phone_number,
        "first_name": worker.first_name,
        "last_name": worker.last_name,
        "bvn": worker.bvn,
        "nin": worker.nin,
        "role": "WORKER"
    }

class WorkerResetPassword(BaseModel):
    phone_number: str
    nin: str
    new_password: str

@router.post("/reset-password")
async def reset_password(req: WorkerResetPassword, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InformalWorker).where(InformalWorker.phone_number == req.phone_number, InformalWorker.nin == req.nin))
    worker = result.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="User not found or NIN incorrect")
        
    worker.password_hash = get_password_hash(req.new_password)
    await db.commit()
    return {"status": "success"}

@router.get("/passport-lookup/{code}")
async def get_worker_by_passport(code: str, db: AsyncSession = Depends(get_db)):
    passport_res = await db.execute(select(TrustPassport).where(TrustPassport.code == code))
    passport = passport_res.scalars().first()
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    worker_res = await db.execute(select(InformalWorker).where(InformalWorker.id == passport.worker_id))
    worker = worker_res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
        
    return {
        "id": str(worker.id),
        "first_name": worker.first_name,
        "last_name": worker.last_name,
    }

@router.get("/{id}/data-export")
async def export_worker_data(id: str):
    return {"worker_id": id, "summary": "Human-readable summary of worker contributions, tier, and score."}

@router.delete("/{id}")
async def delete_worker(id: str):
    return {"status": "deletion_scheduled", "worker_id": id}

@router.get("/{worker_id}/dashboard")
async def get_worker_dashboard(worker_id: str, db: AsyncSession = Depends(get_db)):
    worker_res = await db.execute(select(InformalWorker).where(InformalWorker.id == uuid.UUID(worker_id)))
    worker = worker_res.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    score_res = await db.execute(select(TrustScore).where(TrustScore.worker_id == worker.id))
    trust_score = score_res.scalars().first()
    
    passport_res = await db.execute(select(TrustPassport).where(TrustPassport.worker_id == worker.id))
    passport = passport_res.scalars().first()
    if not passport:
        # Retroactively create one for existing users
        new_code = "TP-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        passport = TrustPassport(worker_id=worker.id, code=new_code)
        db.add(passport)
        await db.commit()
        await db.refresh(passport)
    
    group_info = None
    group_mem_res = await db.execute(select(GroupMembership).where(GroupMembership.worker_id == worker.id))
    membership = group_mem_res.scalars().first()
    if membership:
        grp_res = await db.execute(select(AjoGroup).where(AjoGroup.id == membership.group_id))
        group = grp_res.scalars().first()
        if group:
            col_res = await db.execute(select(AjoCollector).where(AjoCollector.id == group.collector_id))
            collector = col_res.scalars().first()
            group_info = {
                "name": group.name,
                "cycle_duration": group.cycle_duration_days,
                "collector_name": collector.name if collector else "Unknown"
            }

    contrib_res = await db.execute(
        select(Contribution).where(Contribution.worker_id == worker.id).order_by(Contribution.payment_date.asc())
    )
    contributions = contrib_res.scalars().all()
    
    monthly_savings = {}
    payment_dates = []
    for c in contributions:
        if c.payment_date:
            month = c.payment_date.strftime("%b")
            monthly_savings[month] = monthly_savings.get(month, 0) + float(c.amount)
            payment_dates.append(c.payment_date.strftime("%Y-%m-%d"))
            
    chart_data = [{"month": k, "amount": v} for k, v in monthly_savings.items()]
    if not chart_data:
        chart_data = [{"month": "No Data", "amount": 0}]

    return {
        "profile": {
            "firstName": worker.first_name,
            "lastName": worker.last_name,
            "phone": worker.phone_number,
            "bvn": worker.bvn,
            "nin": worker.nin,
            "passportCode": passport.code
        },
        "trust": {
            "score": trust_score.composite_score if trust_score else 0,
            "tier": trust_score.tier if trust_score else "UNRATED"
        },
        "group": group_info,
        "savings_chart": chart_data,
        "payment_dates": payment_dates
    }

from app.modules.admin.models.complaint import Complaint

class ComplaintCreate(BaseModel):
    subject: str
    description: str

@router.post("/{worker_id}/complaints")
async def create_complaint(worker_id: str, req: ComplaintCreate, db: AsyncSession = Depends(get_db)):
    worker_uuid = uuid.UUID(worker_id)
    new_complaint = Complaint(
        worker_id=worker_uuid,
        subject=req.subject,
        description=req.description
    )
    db.add(new_complaint)
    await db.commit()
    await db.refresh(new_complaint)
    return {"status": "success", "complaint_id": str(new_complaint.id)}

@router.get("/{worker_id}/complaints")
async def get_worker_complaints(worker_id: str, db: AsyncSession = Depends(get_db)):
    worker_uuid = uuid.UUID(worker_id)
    res = await db.execute(select(Complaint).where(Complaint.worker_id == worker_uuid).order_by(Complaint.created_at.desc()))
    complaints = res.scalars().all()
    return [
        {
            "id": str(c.id),
            "subject": c.subject,
            "description": c.description,
            "status": c.status.value,
            "created_at": c.created_at.isoformat()
        } for c in complaints
    ]
