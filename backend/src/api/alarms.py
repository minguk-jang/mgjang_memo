"""Alarm API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    AlarmCreate,
    AlarmUpdate,
    AlarmResponse,
)
from ..services.alarm_service import AlarmService
from .auth import get_current_user

router = APIRouter(prefix="/api/v1/alarms", tags=["alarms"])


@router.post("", response_model=AlarmResponse, status_code=status.HTTP_201_CREATED)
async def create_alarm(
    alarm_data: AlarmCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new alarm for memo."""
    try:
        alarm = AlarmService.create_alarm(
            db,
            alarm_data.memo_id,
            current_user.id,
            alarm_data,
            user_timezone=current_user.timezone,
        )

        if not alarm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memo not found",
            )

        return AlarmResponse.from_orm(alarm)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch("/{alarm_id}", response_model=AlarmResponse)
async def update_alarm(
    alarm_id: UUID,
    alarm_data: AlarmUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update alarm."""
    try:
        alarm = AlarmService.update_alarm(db, alarm_id, current_user.id, alarm_data)

        if not alarm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alarm not found",
            )

        return AlarmResponse.from_orm(alarm)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{alarm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alarm(
    alarm_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete alarm."""
    success = AlarmService.delete_alarm(db, alarm_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found",
        )

    return None
