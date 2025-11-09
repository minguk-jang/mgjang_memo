"""Alarm API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database import get_db
from src.schemas import AlarmCreate, AlarmUpdate, AlarmResponse
from src.services.alarm_service import AlarmService
from src.services.memo_service import MemoService
from src.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/alarms", tags=["Alarms"])


@router.post("", response_model=AlarmResponse, status_code=201)
async def create_alarm(
    alarm_data: AlarmCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create an alarm for a memo."""
    # Verify user owns the memo
    memo = MemoService.get_memo(db, alarm_data.memo_id, current_user["user_id"])
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    
    alarm = AlarmService.create_alarm(db, alarm_data)
    if not alarm:
        raise HTTPException(status_code=400, detail="Failed to create alarm")
    return alarm


@router.patch("/{alarm_id}", response_model=AlarmResponse)
async def update_alarm(
    alarm_id: int,
    alarm_data: AlarmUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an alarm."""
    alarm = AlarmService.get_alarm(db, alarm_id)
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    # Verify user owns the memo
    memo = MemoService.get_memo(db, alarm.memo_id, current_user["user_id"])
    if not memo:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    updated = AlarmService.update_alarm(db, alarm_id, alarm_data)
    return updated


@router.delete("/{alarm_id}", status_code=204)
async def delete_alarm(
    alarm_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an alarm."""
    alarm = AlarmService.get_alarm(db, alarm_id)
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    # Verify user owns the memo
    memo = MemoService.get_memo(db, alarm.memo_id, current_user["user_id"])
    if not memo:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    AlarmService.delete_alarm(db, alarm_id)
    return None
