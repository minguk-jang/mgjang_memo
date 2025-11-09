"""Recurrence pattern validation and calculation utilities."""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Optional, List
import json


def validate_recurrence_pattern(recurrence_type: str, recurrence_days: Optional[str]) -> bool:
    """Validate recurrence pattern based on type."""
    if recurrence_type == "daily":
        return recurrence_days is None or recurrence_days == ""
    
    elif recurrence_type == "weekly":
        if not recurrence_days:
            return False
        try:
            days = json.loads(recurrence_days) if isinstance(recurrence_days, str) else recurrence_days
            return isinstance(days, list) and all(0 <= d <= 6 for d in days)
        except:
            return False
    
    elif recurrence_type == "monthly":
        if not recurrence_days:
            return False
        try:
            days = json.loads(recurrence_days) if isinstance(recurrence_days, str) else recurrence_days
            return isinstance(days, list) and all(1 <= d <= 31 for d in days)
        except:
            return False
    
    elif recurrence_type == "custom":
        if not recurrence_days:
            return False
        try:
            days = json.loads(recurrence_days) if isinstance(recurrence_days, str) else recurrence_days
            return isinstance(days, list) and all(0 <= d <= 6 for d in days)
        except:
            return False
    
    return False


def calculate_next_trigger_time(
    scheduled_time: str,
    recurrence_type: str,
    recurrence_days: Optional[str],
    user_timezone: str
) -> datetime:
    """Calculate next trigger time based on recurrence pattern."""
    
    from src.utils.timezone import convert_to_utc
    
    # Parse scheduled time (HH:MM format)
    hours, minutes = map(int, scheduled_time.split(":"))
    
    # Get current time in user's timezone
    now_utc = datetime.now(ZoneInfo("UTC"))
    user_tz = ZoneInfo(user_timezone)
    now_local = now_utc.astimezone(user_tz)
    
    if recurrence_type == "daily":
        return _calculate_next_daily(hours, minutes, now_local, user_tz)
    elif recurrence_type == "weekly":
        days = json.loads(recurrence_days) if isinstance(recurrence_days, str) else recurrence_days
        return _calculate_next_weekly(hours, minutes, days, now_local, user_tz)
    elif recurrence_type == "monthly":
        days = json.loads(recurrence_days) if isinstance(recurrence_days, str) else recurrence_days
        return _calculate_next_monthly(hours, minutes, days, now_local, user_tz)
    elif recurrence_type == "custom":
        days = json.loads(recurrence_days) if isinstance(recurrence_days, str) else recurrence_days
        return _calculate_next_custom(hours, minutes, days, now_local, user_tz)
    
    # Default to daily
    return _calculate_next_daily(hours, minutes, now_local, user_tz)


def _calculate_next_daily(hours: int, minutes: int, now_local: datetime, user_tz: ZoneInfo) -> datetime:
    """Calculate next trigger for daily recurrence."""
    next_local = now_local.replace(hour=hours, minute=minutes, second=0, microsecond=0)
    
    if next_local <= now_local:
        next_local += timedelta(days=1)
    
    return next_local.astimezone(ZoneInfo("UTC"))


def _calculate_next_weekly(hours: int, minutes: int, days: List[int], now_local: datetime, user_tz: ZoneInfo) -> datetime:
    """Calculate next trigger for weekly recurrence."""
    days_set = set(days)
    current_weekday = now_local.weekday()
    
    next_local = now_local.replace(hour=hours, minute=minutes, second=0, microsecond=0)
    
    # Check if we can trigger today
    if current_weekday in days_set and next_local > now_local:
        return next_local.astimezone(ZoneInfo("UTC"))
    
    # Find next matching weekday
    for i in range(1, 8):
        check_date = now_local + timedelta(days=i)
        if check_date.weekday() in days_set:
            next_local = check_date.replace(hour=hours, minute=minutes, second=0, microsecond=0)
            return next_local.astimezone(ZoneInfo("UTC"))
    
    # Fallback to first day in pattern
    for i in range(1, 8):
        check_date = now_local + timedelta(days=i)
        if check_date.weekday() in days_set:
            next_local = check_date.replace(hour=hours, minute=minutes, second=0, microsecond=0)
            return next_local.astimezone(ZoneInfo("UTC"))
    
    return next_local.astimezone(ZoneInfo("UTC"))


def _calculate_next_monthly(hours: int, minutes: int, days: List[int], now_local: datetime, user_tz: ZoneInfo) -> datetime:
    """Calculate next trigger for monthly recurrence."""
    current_day = now_local.day
    current_month = now_local.month
    current_year = now_local.year
    
    next_local = now_local.replace(hour=hours, minute=minutes, second=0, microsecond=0)
    
    # Check if we can trigger this month
    for day in sorted(days):
        if day >= current_day:
            try:
                candidate = next_local.replace(day=day)
                if candidate > now_local:
                    return candidate.astimezone(ZoneInfo("UTC"))
            except ValueError:
                # Day doesn't exist in this month
                continue
    
    # Move to next month
    if current_month == 12:
        next_month = 1
        next_year = current_year + 1
    else:
        next_month = current_month + 1
        next_year = current_year
    
    for day in sorted(days):
        try:
            candidate = next_local.replace(year=next_year, month=next_month, day=day)
            return candidate.astimezone(ZoneInfo("UTC"))
        except ValueError:
            continue
    
    return next_local.astimezone(ZoneInfo("UTC"))


def _calculate_next_custom(hours: int, minutes: int, days: List[int], now_local: datetime, user_tz: ZoneInfo) -> datetime:
    """Calculate next trigger for custom recurrence (same as weekly)."""
    return _calculate_next_weekly(hours, minutes, days, now_local, user_tz)
