from sqlalchemy import Column, String, DateTime, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.shared.db.base import Base
import uuid

class ConsentLog(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('informal_worker.id'), nullable=False)
    event_type = Column(String(100)) # e.g., CONSENT_GRANTED, LENDER_ACCESS_GRANTED
    channel = Column(String(50)) # SMS, USSD
    details = Column(JSONB, default=dict)
    timestamp = Column(DateTime(timezone=True), server_default=text('now()'))
