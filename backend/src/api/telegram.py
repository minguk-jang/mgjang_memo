"""Telegram integration API endpoints."""

import secrets
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import TelegramLinkingCode
from ..schemas import TelegramLinkingCodeResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/v1/telegram", tags=["telegram"])


@router.post("/linking-code", response_model=TelegramLinkingCodeResponse)
async def generate_linking_code(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate Telegram linking code (expires in 10 minutes)."""
    # Generate unique code
    code = secrets.token_urlsafe(24)[:32]

    # Create linking code
    linking_code = TelegramLinkingCode(
        code=code,
        user_id=current_user.id,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used=False,
    )

    db.add(linking_code)
    db.commit()
    db.refresh(linking_code)

    return TelegramLinkingCodeResponse(
        code=code,
        expires_at=linking_code.expires_at,
    )


@router.post("/unlink")
async def unlink_telegram(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unlink Telegram account."""
    current_user.telegram_chat_id = None
    db.commit()
    db.refresh(current_user)

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "timezone": current_user.timezone,
        "telegram_linked": False,
        "created_at": current_user.created_at.isoformat(),
        "updated_at": current_user.updated_at.isoformat(),
    }


@router.post("/webhook")
async def telegram_webhook(request_body: dict):
    """Telegram Bot webhook endpoint (for production)."""
    # This will be fully implemented in Phase 7
    # For now, just acknowledge
    return {"status": "ok"}
