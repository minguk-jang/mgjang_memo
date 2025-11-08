"""Alarm model definition."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..database import Base


class Alarm(Base):
    """Alarm/schedule model for recurring notifications."""

    __tablename__ = "alarms"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign key
    memo_id = Column(UUID(as_uuid=True), ForeignKey("memos.id", ondelete="CASCADE"), nullable=False, index=True)

    # Scheduling
    scheduled_time = Column(String(5), nullable=False)  # HH:MM format (24-hour)
    recurrence_type = Column(String(20), nullable=False)  # 'daily', 'weekly', 'monthly', 'custom'
    recurrence_days = Column(JSON, nullable=True)  # [0,1,2,3,4,5,6] for weekly, etc.
    user_timezone = Column(String(50), nullable=False, default="UTC")

    # Execution tracking
    next_trigger_time = Column(DateTime, nullable=False, index=True)
    last_triggered = Column(DateTime, nullable=True)
    enabled = Column(Boolean, default=True, index=True)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    memo = relationship("Memo", back_populates="alarms")
    history = relationship("AlarmHistory", back_populates="alarm", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Alarm(id={self.id}, scheduled_time={self.scheduled_time}, type={self.recurrence_type})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "memo_id": str(self.memo_id),
            "scheduled_time": self.scheduled_time,
            "recurrence_type": self.recurrence_type,
            "recurrence_days": self.recurrence_days,
            "next_trigger_time": self.next_trigger_time.isoformat(),
            "last_triggered": self.last_triggered.isoformat() if self.last_triggered else None,
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
