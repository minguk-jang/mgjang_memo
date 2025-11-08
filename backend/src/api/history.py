"""Alarm history API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AlarmHistory, Alarm, Memo
from ..schemas import AlarmHistoryResponse, PaginatedResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/v1/history", tags=["history"])


@router.get("/{alarm_id}", response_model=PaginatedResponse)
async def get_alarm_history(
    alarm_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get alarm history (delivery status and triggers)."""
    # Verify ownership
    alarm = db.query(Alarm).join(Memo).filter(
        Alarm.id == alarm_id,
        Memo.user_id == current_user.id,
    ).first()

    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found",
        )

    # Get history
    query = db.query(AlarmHistory).filter(AlarmHistory.alarm_id == alarm_id)
    total = query.count()

    history = (
        query
        .order_by(AlarmHistory.triggered_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "items": [AlarmHistoryResponse.from_orm(h) for h in history],
        "total": total,
    }
