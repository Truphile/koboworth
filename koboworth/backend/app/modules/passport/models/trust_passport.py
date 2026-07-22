from sqlalchemy import Column, String, DateTime, Boolean, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.shared.db.base import Base
import uuid

class TrustPassport(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('informal_worker.id'), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    pdf_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
