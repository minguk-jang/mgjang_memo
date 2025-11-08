"""TelegramLinkingCode model definition."""

from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..database import Base


class TelegramLinkingCode(Base):
    """One-time codes for linking Telegram to dashboard account."""

    __tablename__ = "telegram_linking_codes"

    # Primary key (code is the PK)
    code = Column(String(32), primary_key=True)

    # Foreign key
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # State
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:
        return f"<TelegramLinkingCode(code={self.code}, used={self.used})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "code": self.code,
            "expires_at": self.expires_at.isoformat(),
            "used": self.used,
        }
