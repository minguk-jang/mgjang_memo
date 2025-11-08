"""Memo model definition."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..database import Base


class Memo(Base):
    """Memo/task model representing user's notes and reminders."""

    __tablename__ = "memos"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign key
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Content
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="memos")
    alarms = relationship("Alarm", back_populates="memo", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Memo(id={self.id}, title={self.title})>"

    def to_dict(self, include_alarms=False):
        """Convert model to dictionary."""
        data = {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

        if include_alarms and self.alarms:
            data["alarms"] = [alarm.to_dict() for alarm in self.alarms]
            if self.alarms:
                data["next_alarm_time"] = self.alarms[0].next_trigger_time.isoformat()

        return data
