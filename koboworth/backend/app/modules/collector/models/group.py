from sqlalchemy import Column, String, DateTime, Boolean, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.shared.db.base import Base
import uuid

class AjoGroup(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    collector_id = Column(UUID(as_uuid=True), ForeignKey('ajo_collector.id'), nullable=False)
    cycle_duration_days = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))

class GroupMembership(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey('ajo_group.id'), nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('informal_worker.id'), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=text('now()'))
    is_active = Column(Boolean, default=True)
