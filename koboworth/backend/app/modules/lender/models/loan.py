from sqlalchemy import Column, Numeric, String, DateTime, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.shared.db.base import Base
import uuid

class Loan(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lender_id = Column(UUID(as_uuid=True), ForeignKey('lender.id'), nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('informal_worker.id'), nullable=False)
    passport_id = Column(UUID(as_uuid=True), ForeignKey('trust_passport.id'), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default='PENDING') # PENDING, APPROVED, REPAID, DEFAULTED
    disbursed_at = Column(DateTime(timezone=True))
    due_date = Column(DateTime(timezone=True))
