"""User model for authentication and profile management."""

from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.database import Base


class User(Base):
    """User model for storing user authentication and profile data."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    telegram_chat_id = Column(String(255), nullable=True, index=True)
    timezone = Column(String(50), default="UTC", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    memos = relationship("Memo", back_populates="user", cascade="all, delete-orphan")
    telegram_codes = relationship("TelegramLinkingCode", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_telegram_chat_id", "telegram_chat_id"),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
