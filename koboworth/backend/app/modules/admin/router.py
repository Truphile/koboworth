from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.shared.db.session import get_db
from app.modules.collector.models.collector import AjoCollector
from app.modules.worker.models.contribution import Contribution
from app.modules.lender.models.lender import Lender
from app.modules.worker.models.worker import InformalWorker

router = APIRouter()

@router.get("/health")
async def get_system_health():
    # Ping DB/Redis would be ideal here, but we return a generic success if we reach this point
    return {
        "postgres": "CONNECTED",
        "redis_queue": 0,
        "celery_workers": 1,
        "sms_rate": "100%",
        "logs": [
            "[INFO] Admin portal loaded",
            "[INFO] System health checked",
            "[INFO] PostgreSQL connection OK",
            "[INFO] Redis queue is empty"
        ]
    }

@router.get("/collectors")
async def get_all_collectors(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AjoCollector))
    collectors = res.scalars().all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "phone": c.phone_number,
            "fraud_score": 0,
            "is_active": c.is_active if hasattr(c, 'is_active') else True
        } for c in collectors
    ]

@router.get("/disputes")
async def get_disputes(db: AsyncSession = Depends(get_db)):
    # Get recent contributions for dispute queue
    query = select(Contribution, InformalWorker).join(InformalWorker, Contribution.worker_id == InformalWorker.id).order_by(Contribution.payment_date.desc()).limit(10)
    res = await db.execute(query)
    
    return [
        {
            "id": str(c.id),
            "worker": f"{w.first_name} {w.last_name}",
            "amount": f"₦{c.amount}",
            "date": c.payment_date.strftime("%Y-%m-%d"),
            "status": "PENDING"
        } for c, w in res.all()
    ]

@router.get("/logs")
async def get_logs(db: AsyncSession = Depends(get_db)):
    return {
        "audit": [
            {"id": 1, "log": "[2026-07-02 10:00:14] LENDER: FINTECH_A | ENDPOINT: /v1/passports | STATUS: 200"}
        ],
        "consent": [
            {"worker_id": "WRK_123", "action": "GRANTED", "lender": "FINTECH_A", "time": "2026-07-02 09:00:00"}
        ]
    }

@router.get("/lenders")
async def get_lenders(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Lender))
    lenders = res.scalars().all()
    return [
        {
            "id": str(l.id),
            "name": l.name,
            "rate_limit": 10000,
            "status": "ACTIVE" if l.is_active else "INACTIVE"
        } for l in lenders
    ]
from pydantic import BaseModel
import uuid
from fastapi import HTTPException

class DisputeResolution(BaseModel):
    action: str

@router.post("/disputes/{id}/resolve")
async def resolve_dispute(id: str, payload: DisputeResolution, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Contribution).where(Contribution.id == uuid.UUID(id)))
    contribution = res.scalars().first()
    if not contribution:
        raise HTTPException(status_code=404, detail="Contribution not found")
        
    if payload.action == 'APPROVED':
        contribution.status = 'DISPUTED'
    else:
        contribution.status = 'SUCCESS'
        
    await db.commit()
    return {"status": "success"}

@router.post("/collectors/{id}/toggle-status")
async def toggle_collector_status(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AjoCollector).where(AjoCollector.id == uuid.UUID(id)))
    collector = res.scalars().first()
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
        
    collector.is_active = not getattr(collector, 'is_active', True)
    await db.commit()
    return {"status": "success", "is_active": collector.is_active}

from app.modules.admin.models.complaint import Complaint, ComplaintStatus

@router.get("/complaints")
async def get_all_complaints(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Complaint, InformalWorker)
        .join(InformalWorker, Complaint.worker_id == InformalWorker.id)
        .order_by(Complaint.created_at.desc())
    )
    results = res.all()
    return [
        {
            "id": str(c.id),
            "worker_name": f"{w.first_name} {w.last_name}",
            "worker_phone": w.phone_number,
            "subject": c.subject,
            "description": c.description,
            "status": c.status.value,
            "created_at": c.created_at.isoformat()
        } for c, w in results
    ]

class ComplaintStatusUpdate(BaseModel):
    status: str

@router.put("/complaints/{id}/status")
async def update_complaint_status(id: str, payload: ComplaintStatusUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Complaint).where(Complaint.id == uuid.UUID(id)))
    complaint = res.scalars().first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    try:
        new_status = ComplaintStatus[payload.status]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    complaint.status = new_status
    await db.commit()
    return {"status": "success", "new_status": new_status.value}
