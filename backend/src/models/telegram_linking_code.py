"""TelegramLinkingCode model for secure Telegram account linking."""

from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.database import Base


class TelegramLinkingCode(Base):
    """TelegramLinkingCode model for temporary linking codes."""
    
    __tablename__ = "telegram_linking_codes"
    
    code = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime, nullable=False)  # 10 minutes from creation
    used = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="telegram_codes")
    
    __table_args__ = (
        Index("idx_telegram_code", "code"),
        Index("idx_telegram_user_id", "user_id"),
    )
    
    def __repr__(self):
        return f"<TelegramLinkingCode(code={self.code}, user_id={self.user_id})>"
