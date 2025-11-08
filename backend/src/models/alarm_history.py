"""AlarmHistory model definition."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..database import Base


class AlarmHistory(Base):
    """Audit trail of alarm triggers and delivery status."""

    __tablename__ = "alarm_history"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign key
    alarm_id = Column(UUID(as_uuid=True), ForeignKey("alarms.id", ondelete="CASCADE"), nullable=False, index=True)

    # Trigger info
    triggered_at = Column(DateTime, nullable=False)
    delivery_status = Column(String(20), nullable=False)  # 'sent', 'failed', 'pending'
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    # Relationships
    alarm = relationship("Alarm", back_populates="history")

    def __repr__(self) -> str:
        return f"<AlarmHistory(id={self.id}, status={self.delivery_status})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "alarm_id": str(self.alarm_id),
            "triggered_at": self.triggered_at.isoformat(),
            "delivery_status": self.delivery_status,
            "error_message": self.error_message,
            "retry_count": self.retry_count,
            "created_at": self.created_at.isoformat(),
        }
