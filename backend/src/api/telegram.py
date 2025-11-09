"""Telegram integration API endpoints (Phase 7)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
import logging

from src.database import get_db
from src.middleware.auth import get_current_user
from src.models import User, TelegramLinkingCode
from src.schemas import TelegramLinkingCodeResponse

router = APIRouter(prefix="/api/v1/telegram", tags=["Telegram"])
logger = logging.getLogger(__name__)


@router.post("/linking-code", response_model=TelegramLinkingCodeResponse)
async def generate_linking_code(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a Telegram linking code (10 minute expiry)."""
    code = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Clean up old codes
    db.query(TelegramLinkingCode).filter(
        TelegramLinkingCode.user_id == current_user["user_id"],
        TelegramLinkingCode.used == False
    ).delete()
    
    linking_code = TelegramLinkingCode(
        code=code,
        user_id=current_user["user_id"],
        expires_at=expires_at
    )
    db.add(linking_code)
    db.commit()
    db.refresh(linking_code)
    
    return linking_code


@router.post("/unlink")
async def unlink_telegram(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlink Telegram account from user."""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.telegram_chat_id = None
    db.commit()
    
    return {"detail": "Telegram account unlinked"}
