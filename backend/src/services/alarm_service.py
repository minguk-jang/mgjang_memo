"""Service for alarm management and scheduling."""

from sqlalchemy.orm import Session
from src.models import Alarm, Memo, AlarmHistory
from src.schemas import AlarmCreate, AlarmUpdate
from src.utils.recurrence import calculate_next_trigger_time, validate_recurrence_pattern
from typing import List, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class AlarmService:
    """Service for alarm operations."""
    
    @staticmethod
    def create_alarm(db: Session, alarm_data: AlarmCreate) -> Optional[Alarm]:
        """Create a new alarm for a memo."""
        # Validate recurrence pattern
        if not validate_recurrence_pattern(alarm_data.recurrence_type, alarm_data.recurrence_days):
            logger.warning(f"Invalid recurrence pattern: {alarm_data.recurrence_type}")
            return None
        
        # Check memo exists
        memo = db.query(Memo).filter(Memo.id == alarm_data.memo_id).first()
        if not memo:
            logger.warning(f"Memo not found: {alarm_data.memo_id}")
            return None
        
        # Calculate next trigger time
        next_trigger = calculate_next_trigger_time(
            alarm_data.scheduled_time,
            alarm_data.recurrence_type,
            alarm_data.recurrence_days,
            alarm_data.user_timezone
        )
        
        alarm = Alarm(
            memo_id=alarm_data.memo_id,
            scheduled_time=alarm_data.scheduled_time,
            recurrence_type=alarm_data.recurrence_type,
            recurrence_days=alarm_data.recurrence_days,
            next_trigger_time=next_trigger,
            user_timezone=alarm_data.user_timezone,
            enabled=True
        )
        db.add(alarm)
        db.commit()
        db.refresh(alarm)
        logger.info(f"Alarm created: {alarm.id} for memo {alarm_data.memo_id}")
        return alarm
    
    @staticmethod
    def get_alarm(db: Session, alarm_id: int) -> Optional[Alarm]:
        """Get a specific alarm by ID."""
        return db.query(Alarm).filter(Alarm.id == alarm_id).first()
    
    @staticmethod
    def list_alarms_for_memo(db: Session, memo_id: int) -> List[Alarm]:
        """List all alarms for a memo."""
        return db.query(Alarm).filter(Alarm.memo_id == memo_id).all()
    
    @staticmethod
    def update_alarm(db: Session, alarm_id: int, alarm_data: AlarmUpdate) -> Optional[Alarm]:
        """Update an alarm."""
        alarm = AlarmService.get_alarm(db, alarm_id)
        if not alarm:
            return None
        
        if alarm_data.scheduled_time is not None:
            alarm.scheduled_time = alarm_data.scheduled_time
        if alarm_data.recurrence_type is not None:
            alarm.recurrence_type = alarm_data.recurrence_type
        if alarm_data.recurrence_days is not None:
            alarm.recurrence_days = alarm_data.recurrence_days
        
        # Recalculate next trigger time
        next_trigger = calculate_next_trigger_time(
            alarm.scheduled_time,
            alarm.recurrence_type,
            alarm.recurrence_days,
            alarm.user_timezone
        )
        alarm.next_trigger_time = next_trigger
        
        db.commit()
        db.refresh(alarm)
        logger.info(f"Alarm updated: {alarm.id}")
        return alarm
    
    @staticmethod
    def delete_alarm(db: Session, alarm_id: int) -> bool:
        """Delete an alarm."""
        alarm = AlarmService.get_alarm(db, alarm_id)
        if not alarm:
            return False
        
        db.delete(alarm)
        db.commit()
        logger.info(f"Alarm deleted: {alarm_id}")
        return True
    
    @staticmethod
    def update_alarm_after_trigger(db: Session, alarm_id: int) -> Optional[Alarm]:
        """Update alarm's next trigger time after it has been triggered."""
        alarm = AlarmService.get_alarm(db, alarm_id)
        if not alarm:
            return None
        
        alarm.last_triggered = datetime.now(timezone.utc)
        
        # Recalculate next trigger
        next_trigger = calculate_next_trigger_time(
            alarm.scheduled_time,
            alarm.recurrence_type,
            alarm.recurrence_days,
            alarm.user_timezone
        )
        alarm.next_trigger_time = next_trigger
        
        db.commit()
        db.refresh(alarm)
        return alarm
