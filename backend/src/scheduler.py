"""APScheduler configuration and setup."""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.base import JobLookupError
import logging

logger = logging.getLogger(__name__)


class AlarmScheduler:
    """Wrapper for APScheduler background scheduler."""
    
    def __init__(self):
        """Initialize the scheduler."""
        self.scheduler = BackgroundScheduler()
    
    def start(self):
        """Start the scheduler."""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Alarm scheduler started")
    
    def stop(self):
        """Stop the scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Alarm scheduler stopped")
    
    def add_job(self, func, trigger: str, id: str, **kwargs):
        """Add a job to the scheduler."""
        try:
            self.scheduler.add_job(func, trigger, id=id, replace_existing=True, **kwargs)
            logger.info(f"Job {id} added: {trigger}")
        except Exception as e:
            logger.error(f"Failed to add job {id}: {e}")
    
    def remove_job(self, job_id: str):
        """Remove a job from the scheduler."""
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Job {job_id} removed")
        except JobLookupError:
            logger.warning(f"Job {job_id} not found")
    
    def get_jobs(self):
        """Get all scheduled jobs."""
        return self.scheduler.get_jobs()


# Global scheduler instance
scheduler = AlarmScheduler()
