from sqlalchemy import Column, String, DateTime, Boolean, text, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.shared.db.base import Base
import uuid

class AjoCollector(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    region = Column(String(100))
    is_verified = Column(Boolean, default=False)
    
    pin_hash = Column(String(255), nullable=True)
    failed_pin_attempts = Column(Integer, default=0)
    lockout_until = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
