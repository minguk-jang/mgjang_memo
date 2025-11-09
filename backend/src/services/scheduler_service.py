"""Service for alarm scheduling and delivery."""

from sqlalchemy.orm import Session
from src.models import Alarm, AlarmHistory, User
from src.database import SessionLocal
from src.services.alarm_service import AlarmService
from src.services.telegram_service import TelegramNotificationService
from datetime import datetime, timezone
import asyncio
import logging

logger = logging.getLogger(__name__)


class AlarmSchedulerService:
    """Service for checking and processing due alarms."""
    
    @staticmethod
    def check_due_alarms(db: Session) -> int:
        """Check for alarms that are due to trigger."""
        now_utc = datetime.now(timezone.utc)
        
        # Find alarms that are due (within next minute window)
        due_alarms = db.query(Alarm).filter(
            Alarm.enabled == True,
            Alarm.next_trigger_time <= now_utc
        ).all()
        
        count = 0
        for alarm in due_alarms:
            success = AlarmSchedulerService.process_alarm(db, alarm)
            if success:
                count += 1
        
        logger.info(f"Processed {count} due alarms")
        return count
    
    @staticmethod
    def process_alarm(db: Session, alarm: Alarm) -> bool:
        """Process a single alarm trigger."""
        try:
            # Get memo and user info
            memo = alarm.memo
            if not memo:
                logger.warning(f"Memo not found for alarm {alarm.id}")
                return False
            
            user = memo.user
            if not user:
                logger.warning(f"User not found for memo {memo.id}")
                return False
            
            # Send Telegram notification if linked
            delivery_status = "sent"
            error_message = None
            
            if user.telegram_chat_id:
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    success, error = loop.run_until_complete(
                        TelegramNotificationService.send_telegram_message(
                            user.telegram_chat_id,
                            memo.title,
                            memo.description or ""
                        )
                    )
                    loop.close()
                    
                    if not success:
                        delivery_status = "failed"
                        error_message = error
                except Exception as e:
                    delivery_status = "failed"
                    error_message = str(e)
                    logger.error(f"Error sending notification for alarm {alarm.id}: {e}")
            else:
                delivery_status = "pending"
                error_message = "User has not linked Telegram account"
            
            # Record in alarm history
            history = AlarmHistory(
                alarm_id=alarm.id,
                triggered_at=datetime.now(timezone.utc),
                delivery_status=delivery_status,
                error_message=error_message,
                retry_count=0
            )
            db.add(history)
            
            # Update alarm's next trigger time
            AlarmService.update_alarm_after_trigger(db, alarm.id)
            
            db.commit()
            logger.info(f"Alarm {alarm.id} processed: {delivery_status}")
            return delivery_status == "sent"
        
        except Exception as e:
            logger.error(f"Error processing alarm {alarm.id}: {e}")
            return False
    
    @staticmethod
    def retry_failed_deliveries(db: Session) -> int:
        """Retry failed Telegram deliveries."""
        # Get failed deliveries from last hour
        from datetime import timedelta
        recent_failures = db.query(AlarmHistory).filter(
            AlarmHistory.delivery_status == "failed",
            AlarmHistory.created_at >= datetime.now(timezone.utc) - timedelta(hours=1),
            AlarmHistory.retry_count < 3
        ).all()
        
        retry_count = 0
        for history in recent_failures:
            alarm = history.alarm
            if alarm:
                success = AlarmSchedulerService.process_alarm(db, alarm)
                if success:
                    history.retry_count += 1
                    db.commit()
                    retry_count += 1
        
        logger.info(f"Retried {retry_count} failed deliveries")
        return retry_count
