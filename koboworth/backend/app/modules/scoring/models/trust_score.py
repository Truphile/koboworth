from sqlalchemy import Column, Integer, Numeric, DateTime, String, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.shared.db.base import Base
import uuid

class TrustScore(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('informal_worker.id'), unique=True, nullable=False)
    composite_score = Column(Integer, nullable=False)
    tier = Column(String(50), nullable=False) # e.g. BRONZE, SILVER, GOLD
    sub_scores = Column(JSONB) # {ajo: X, telco: Y, velocity: Z}
    calculated_at = Column(DateTime(timezone=True), server_default=text('now()'))
