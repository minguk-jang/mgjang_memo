"""AlarmHistory model for tracking alarm triggers and delivery status."""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.database import Base


class AlarmHistory(Base):
    """AlarmHistory model for tracking alarm trigger events and delivery status."""
    
    __tablename__ = "alarm_history"
    
    id = Column(Integer, primary_key=True, index=True)
    alarm_id = Column(Integer, ForeignKey("alarms.id", ondelete="CASCADE"), nullable=False, index=True)
    triggered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    delivery_status = Column(String(20), nullable=False)  # sent, failed, pending
    error_message = Column(String(500), nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    alarm = relationship("Alarm", back_populates="history")
    
    __table_args__ = (
        Index("idx_alarm_history_alarm_id", "alarm_id"),
    )
    
    def __repr__(self):
        return f"<AlarmHistory(id={self.id}, alarm_id={self.alarm_id}, status={self.delivery_status})>"
