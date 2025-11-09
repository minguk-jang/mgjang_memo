"""Alarm history API endpoints (Phase 4+)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database import get_db
from src.schemas import AlarmHistoryResponse
from src.middleware.auth import get_current_user
from src.models import AlarmHistory, Alarm, Memo

router = APIRouter(prefix="/api/v1/history", tags=["History"])


@router.get("/{alarm_id}", response_model=List[AlarmHistoryResponse])
async def get_alarm_history(
    alarm_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get alarm history with pagination."""
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    # Verify user owns the memo
    memo = db.query(Memo).filter(Memo.id == alarm.memo_id, Memo.user_id == current_user["user_id"]).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    history = db.query(AlarmHistory).filter(
        AlarmHistory.alarm_id == alarm_id
    ).offset(skip).limit(limit).all()
    
    return history
