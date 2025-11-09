"""Alarm model with flexible scheduling support."""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Index, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.database import Base
import enum


class AlarmType(enum.Enum):
    """Alarm scheduling types."""
    NONE = "none"           # No alarm
    ONCE = "once"           # One-time alarm at specific datetime
    REPEAT = "repeat"       # Recurring alarm


class RepeatInterval(enum.Enum):
    """Repeat interval types."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class NotificationChannel(enum.Enum):
    """Notification delivery channels."""
    NONE = "none"
    TELEGRAM = "telegram"
    EMAIL = "email"


class Alarm(Base):
    """Alarm model for flexible alarm scheduling."""

    __tablename__ = "alarms"

    id = Column(Integer, primary_key=True, index=True)
    memo_id = Column(Integer, ForeignKey("memos.id", ondelete="CASCADE"), nullable=False, index=True)

    # Flexible alarm scheduling
    alarm_type = Column(SQLEnum(AlarmType), default=AlarmType.REPEAT, nullable=False)
    alarm_time = Column(DateTime(timezone=True), nullable=True)  # For 'once' type: specific datetime; For 'repeat': next trigger
    repeat_interval = Column(SQLEnum(RepeatInterval), nullable=True)  # Only for 'repeat' type
    scheduled_time = Column(String(5), nullable=True)  # HH:MM format for repeat alarms

    # Notification settings
    channel = Column(SQLEnum(NotificationChannel), default=NotificationChannel.TELEGRAM, nullable=False)

    # Legacy fields (for backward compatibility)
    recurrence_type = Column(String(20), default="daily", nullable=True)
    recurrence_days = Column(String(255), nullable=True)
    next_trigger_time = Column(DateTime, nullable=True, index=True)  # UTC time
    last_triggered = Column(DateTime, nullable=True)

    # Control fields
    enabled = Column(Boolean, default=True, nullable=False)
    user_timezone = Column(String(50), default="Asia/Seoul", nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    memo = relationship("Memo", back_populates="alarms")
    history = relationship("AlarmHistory", back_populates="alarm", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_alarm_memo_id", "memo_id"),
        Index("idx_alarm_next_trigger_time", "next_trigger_time"),
        Index("idx_alarm_type_enabled", "alarm_type", "enabled"),
    )

    def __repr__(self):
        return f"<Alarm(id={self.id}, memo_id={self.memo_id}, type={self.alarm_type.value})>"
