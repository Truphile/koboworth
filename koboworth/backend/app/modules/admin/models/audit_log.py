from sqlalchemy import Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.shared.db.base import Base
import uuid

class AuditLog(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(50)) # e.g. LENDER, ADMIN
    entity_id = Column(UUID(as_uuid=True))
    action = Column(String(100))
    metadata_ = Column("metadata", JSONB)
    timestamp = Column(DateTime(timezone=True), server_default=text('now()'))
