from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
import uuid

from app.shared.db.session import get_db
from app.modules.worker.models.worker import InformalWorker
from app.modules.collector.models.collector import AjoCollector
from app.modules.collector.models.group import AjoGroup, GroupMembership
from app.modules.worker.models.contribution import Contribution
from app.core.security import get_password_hash

router = APIRouter()

class CollectorCreate(BaseModel):
    phone_number: str
    name: str
    region: Optional[str] = None
    pin: str

@router.post("")
@router.post("/")
async def create_collector(req: CollectorCreate, db: AsyncSession = Depends(get_db)):
    collector = AjoCollector(
        phone_number=req.phone_number,
        name=req.name,
        region=req.region,
        pin_hash=get_password_hash(req.pin)
    )
    db.add(collector)
    try:
        await db.commit()
        await db.refresh(collector)

        # Send Welcome SMS
        from app.modules.notifications.worker import send_sms
        msg = f"Welcome to Koboworth, {collector.name}! Your Collector dashboard is ready. Start digitizing your Ajo groups today!"
        send_sms.delay(collector.phone_number, msg)

        return {"status": "success", "collector_id": str(collector.id)}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Collector with this phone already exists.")

@router.get("/phone/{phone_number}")
async def get_collector_by_phone(phone_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AjoCollector).where(AjoCollector.phone_number == phone_number))
    collector = result.scalars().first()
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
    return {
        "id": str(collector.id),
        "phone_number": collector.phone_number,
        "name": collector.name,
        "region": collector.region,
        "role": "COLLECTOR"
    }

class GroupCreate(BaseModel):
    name: str
    cycle_duration_days: str

@router.post("/{collector_id}/groups")
async def create_group(collector_id: str, req: GroupCreate, db: AsyncSession = Depends(get_db)):
    group = AjoGroup(
        collector_id=uuid.UUID(collector_id),
        name=req.name,
        cycle_duration_days=req.cycle_duration_days
    )
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return {"status": "success", "group_id": str(group.id), "name": group.name}

@router.get("/{collector_id}/groups")
async def get_collector_groups(collector_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AjoGroup).where(AjoGroup.collector_id == uuid.UUID(collector_id)))
    groups = result.scalars().all()
    
    response = []
    for g in groups:
        mem_res = await db.execute(select(GroupMembership).where(GroupMembership.group_id == g.id))
        members = mem_res.scalars().all()
        response.append({
            "id": str(g.id),
            "name": g.name,
            "cycle_duration": g.cycle_duration_days,
            "member_count": len(members)
        })
    return response

class MemberAdd(BaseModel):
    phone_number: str

@router.post("/groups/{group_id}/members")
async def add_group_member(group_id: str, req: MemberAdd, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InformalWorker).where(InformalWorker.phone_number == req.phone_number))
    worker = result.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found with this phone number. They must register first.")
    
    exist = await db.execute(select(GroupMembership).where(
        GroupMembership.group_id == uuid.UUID(group_id),
        GroupMembership.worker_id == worker.id
    ))
    if exist.scalars().first():
        raise HTTPException(status_code=400, detail="Worker is already in this group.")

    membership = GroupMembership(
        group_id=uuid.UUID(group_id),
        worker_id=worker.id
    )
    db.add(membership)
    await db.commit()
    return {"status": "success", "worker_name": f"{worker.first_name} {worker.last_name}"}

class ContributionCreate(BaseModel):
    phone_number: str
    amount: float

@router.post("/groups/{group_id}/contributions")
async def record_contribution(group_id: str, req: ContributionCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InformalWorker).where(InformalWorker.phone_number == req.phone_number))
    worker = result.scalars().first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")

    exist = await db.execute(select(GroupMembership).where(
        GroupMembership.group_id == uuid.UUID(group_id),
        GroupMembership.worker_id == worker.id
    ))
    if not exist.scalars().first():
        raise HTTPException(status_code=400, detail="Worker is not in this group.")

    ref = f"AJO-{uuid.uuid4().hex[:8].upper()}"
    contribution = Contribution(
        worker_id=worker.id,
        group_id=uuid.UUID(group_id),
        amount=req.amount,
        reference=ref,
        status='SUCCESS'
    )
    db.add(contribution)
    await db.commit()
    return {"status": "success", "reference": ref, "amount": req.amount}

@router.get("/{collector_id}/history")
async def get_collector_history(collector_id: str, db: AsyncSession = Depends(get_db)):
    group_res = await db.execute(select(AjoGroup.id).where(AjoGroup.collector_id == uuid.UUID(collector_id)))
    group_ids = [g for g in group_res.scalars().all()]
    
    if not group_ids:
        return []

    query = (
        select(Contribution, InformalWorker.first_name, InformalWorker.last_name, AjoGroup.name)
        .join(InformalWorker, Contribution.worker_id == InformalWorker.id)
        .join(AjoGroup, Contribution.group_id == AjoGroup.id)
        .where(Contribution.group_id.in_(group_ids))
        .order_by(Contribution.payment_date.desc())
        .limit(50)
    )
    result = await db.execute(query)
    
    history = []
    for c, fn, ln, gn in result.all():
        history.append({
            "id": str(c.id),
            "worker_name": f"{fn} {ln}".strip() or "Unknown Worker",
            "group_name": gn,
            "amount": float(c.amount),
            "reference": c.reference,
            "date": c.payment_date.isoformat() if c.payment_date else None
        })
    return history
