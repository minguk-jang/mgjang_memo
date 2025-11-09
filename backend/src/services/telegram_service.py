"""Service for Telegram notifications."""

from src.models import Memo, Alarm
from src.config import settings
import logging
import os

logger = logging.getLogger(__name__)

try:
    from telegram import Bot
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False


class TelegramNotificationService:
    """Service for sending Telegram notifications."""
    
    @staticmethod
    async def send_telegram_message(chat_id: str, memo_title: str, memo_description: str) -> tuple[bool, str]:
        """Send a Telegram message for a memo."""
        if not TELEGRAM_AVAILABLE:
            logger.warning("python-telegram-bot not installed")
            return False, "Telegram library not available"
        
        if not settings.TELEGRAM_BOT_TOKEN:
            logger.warning("TELEGRAM_BOT_TOKEN not configured")
            return False, "Telegram bot token not configured"
        
        try:
            bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
            message = TelegramNotificationService.format_memo_message(memo_title, memo_description)
            
            await bot.send_message(chat_id=chat_id, text=message)
            logger.info(f"Telegram message sent to {chat_id}")
            return True, ""
        
        except Exception as e:
            error_msg = f"Failed to send Telegram message: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    @staticmethod
    def format_memo_message(memo_title: str, memo_description: str) -> str:
        """Format a memo into a Telegram message."""
        message = f"📋 <b>{memo_title}</b>\n"
        
        if memo_description:
            message += f"\n{memo_description}\n"
        
        message += f"\n⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        return message


from datetime import datetime
