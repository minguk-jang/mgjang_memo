"""Service for alarm operations."""

from uuid import UUID
from datetime import datetime

from sqlalchemy.orm import Session

from ..models import Alarm, Memo
from ..schemas import AlarmCreate, AlarmUpdate
from ..utils.recurrence import calculate_next_trigger_time, validate_recurrence_pattern


class AlarmService:
    """Service for CRUD operations on alarms."""

    @staticmethod
    def create_alarm(
        db: Session,
        memo_id: UUID,
        user_id: UUID,
        alarm_data: AlarmCreate,
        user_timezone: str = "UTC",
    ) -> Alarm | None:
        """Create a new alarm for memo."""
        # Verify ownership
        memo = db.query(Memo).filter(
            Memo.id == memo_id,
            Memo.user_id == user_id,
        ).first()

        if not memo:
            return None

        # Validate recurrence pattern
        if not validate_recurrence_pattern(alarm_data.recurrence_type, alarm_data.recurrence_days):
            raise ValueError("Invalid recurrence pattern")

        # Calculate next trigger time
        next_trigger_time = calculate_next_trigger_time(
            scheduled_time=alarm_data.scheduled_time,
            recurrence_type=alarm_data.recurrence_type,
            recurrence_days=alarm_data.recurrence_days,
            user_timezone=user_timezone,
        )

        alarm = Alarm(
            memo_id=memo_id,
            scheduled_time=alarm_data.scheduled_time,
            recurrence_type=alarm_data.recurrence_type,
            recurrence_days=alarm_data.recurrence_days,
            user_timezone=user_timezone,
            next_trigger_time=next_trigger_time,
            enabled=True,
        )

        db.add(alarm)
        db.commit()
        db.refresh(alarm)
        return alarm

    @staticmethod
    def get_alarm(
        db: Session,
        alarm_id: UUID,
        user_id: UUID,
    ) -> Alarm | None:
        """Get a specific alarm by ID (check ownership via memo)."""
        return db.query(Alarm).join(Memo).filter(
            Alarm.id == alarm_id,
            Memo.user_id == user_id,
        ).first()

    @staticmethod
    def update_alarm(
        db: Session,
        alarm_id: UUID,
        user_id: UUID,
        alarm_data: AlarmUpdate,
    ) -> Alarm | None:
        """Update an alarm (check ownership)."""
        alarm = AlarmService.get_alarm(db, alarm_id, user_id)

        if not alarm:
            return None

        if alarm_data.scheduled_time is not None:
            alarm.scheduled_time = alarm_data.scheduled_time

        if alarm_data.recurrence_type is not None:
            alarm.recurrence_type = alarm_data.recurrence_type

        if alarm_data.recurrence_days is not None:
            alarm.recurrence_days = alarm_data.recurrence_days

        if alarm_data.enabled is not None:
            alarm.enabled = alarm_data.enabled

        # Recalculate next trigger time if schedule changed
        if (alarm_data.scheduled_time is not None or
            alarm_data.recurrence_type is not None or
            alarm_data.recurrence_days is not None):
            alarm.next_trigger_time = calculate_next_trigger_time(
                scheduled_time=alarm.scheduled_time,
                recurrence_type=alarm.recurrence_type,
                recurrence_days=alarm.recurrence_days,
                user_timezone=alarm.user_timezone,
            )

        db.commit()
        db.refresh(alarm)
        return alarm

    @staticmethod
    def delete_alarm(
        db: Session,
        alarm_id: UUID,
        user_id: UUID,
    ) -> bool:
        """Delete an alarm (check ownership)."""
        alarm = AlarmService.get_alarm(db, alarm_id, user_id)

        if not alarm:
            return False

        db.delete(alarm)
        db.commit()
        return True

    @staticmethod
    def get_user_alarms(
        db: Session,
        user_id: UUID,
    ) -> list[Alarm]:
        """Get all enabled alarms for a user."""
        return db.query(Alarm).join(Memo).filter(
            Memo.user_id == user_id,
            Alarm.enabled == True,
        ).order_by(Alarm.next_trigger_time).all()

    @staticmethod
    def update_alarm_after_trigger(
        db: Session,
        alarm_id: UUID,
        new_next_trigger_time: datetime,
    ) -> Alarm | None:
        """Update alarm's next trigger time and last_triggered (for scheduler)."""
        alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()

        if not alarm:
            return None

        alarm.last_triggered = datetime.utcnow()
        alarm.next_trigger_time = new_next_trigger_time

        db.commit()
        db.refresh(alarm)
        return alarm
