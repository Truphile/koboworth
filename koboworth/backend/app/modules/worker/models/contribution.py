from sqlalchemy import Column, Numeric, DateTime, String, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.shared.db.base import Base
import uuid

class Contribution(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('informal_worker.id'), nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey('ajo_group.id'), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default='SUCCESS')
    payment_date = Column(DateTime(timezone=True), server_default=text('now()'))
    reference = Column(String(100), unique=True)
