"""Memo model for storing user memos/tasks."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.database import Base


class Memo(Base):
    """Memo model for storing memo/task information."""
    
    __tablename__ = "memos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="memos")
    alarms = relationship("Alarm", back_populates="memo", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_memo_user_id", "user_id"),
    )
    
    def __repr__(self):
        return f"<Memo(id={self.id}, title={self.title}, user_id={self.user_id})>"
