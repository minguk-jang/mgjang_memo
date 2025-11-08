"""Recurrence pattern utilities for alarm scheduling."""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Optional, List

from .timezone import convert_to_utc, convert_to_user_tz


def validate_recurrence_pattern(
    recurrence_type: str,
    recurrence_days: Optional[List[int]] = None,
) -> bool:
    """Validate recurrence pattern based on type."""
    if recurrence_type == "daily":
        return True
    elif recurrence_type == "weekly":
        return recurrence_days is not None and all(0 <= d <= 6 for d in recurrence_days)
    elif recurrence_type == "monthly":
        return recurrence_days is not None and all(1 <= d <= 31 for d in recurrence_days)
    elif recurrence_type == "custom":
        return recurrence_days is not None and all(0 <= d <= 6 for d in recurrence_days)
    return False


def calculate_next_trigger_time(
    scheduled_time: str,  # "HH:MM"
    recurrence_type: str,
    recurrence_days: Optional[List[int]],
    user_timezone: str,
) -> datetime:
    """Calculate next trigger time in UTC based on recurrence pattern."""
    now_utc = datetime.utcnow()
    now_user_tz = convert_to_user_tz(now_utc, user_timezone)

    # Parse scheduled time
    hour, minute = map(int, scheduled_time.split(":"))

    if recurrence_type == "daily":
        return _calculate_next_daily(now_user_tz, hour, minute, user_timezone)
    elif recurrence_type == "weekly":
        return _calculate_next_weekly(now_user_tz, hour, minute, recurrence_days, user_timezone)
    elif recurrence_type == "monthly":
        return _calculate_next_monthly(now_user_tz, hour, minute, recurrence_days, user_timezone)
    elif recurrence_type == "custom":
        return _calculate_next_custom(now_user_tz, hour, minute, recurrence_days, user_timezone)

    # Default: daily
    return _calculate_next_daily(now_user_tz, hour, minute, user_timezone)


def _calculate_next_daily(
    now_user_tz: datetime,
    hour: int,
    minute: int,
    user_timezone: str,
) -> datetime:
    """Calculate next daily trigger time."""
    next_time = now_user_tz.replace(hour=hour, minute=minute, second=0, microsecond=0)

    if next_time <= now_user_tz:
        next_time += timedelta(days=1)

    return convert_to_utc(next_time, user_timezone)


def _calculate_next_weekly(
    now_user_tz: datetime,
    hour: int,
    minute: int,
    recurrence_days: List[int],
    user_timezone: str,
) -> datetime:
    """Calculate next weekly trigger time."""
    current_weekday = now_user_tz.weekday()  # 0=Monday, 6=Sunday
    # Convert to 0=Sunday, 6=Saturday
    current_weekday_iso = (current_weekday + 1) % 7

    recurrence_days = sorted(recurrence_days)
    next_date = now_user_tz.date()

    # Find next matching weekday
    for day in recurrence_days:
        # Check today
        if day >= current_weekday_iso:
            test_date = next_date
        else:
            # Next week
            test_date = next_date + timedelta(days=7)

        test_datetime = test_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        test_tz = test_datetime.replace(tzinfo=ZoneInfo(user_timezone))

        if test_tz > now_user_tz:
            return convert_to_utc(test_tz, user_timezone)

    # Wrap to next week
    first_day = recurrence_days[0]
    days_until = (first_day - current_weekday_iso) % 7
    if days_until == 0:
        days_until = 7

    next_date = now_user_tz.date() + timedelta(days=days_until)
    next_time = next_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    next_tz = next_time.replace(tzinfo=ZoneInfo(user_timezone))

    return convert_to_utc(next_tz, user_timezone)


def _calculate_next_monthly(
    now_user_tz: datetime,
    hour: int,
    minute: int,
    recurrence_days: List[int],
    user_timezone: str,
) -> datetime:
    """Calculate next monthly trigger time."""
    current_day = now_user_tz.day
    recurrence_days = sorted(recurrence_days)

    # Check this month
    for day in recurrence_days:
        if day >= current_day:
            try:
                next_date = now_user_tz.date().replace(day=day)
                next_time = next_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                next_tz = next_time.replace(tzinfo=ZoneInfo(user_timezone))

                if next_tz > now_user_tz:
                    return convert_to_utc(next_tz, user_timezone)
            except ValueError:
                # Day doesn't exist in month (e.g., Feb 30)
                continue

    # Next month
    if now_user_tz.month == 12:
        first_day_next_month = (now_user_tz + timedelta(days=32)).replace(day=1)
    else:
        first_day_next_month = now_user_tz.replace(month=now_user_tz.month + 1, day=1)

    for day in recurrence_days:
        try:
            next_date = first_day_next_month.replace(day=day)
            next_time = next_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            next_tz = next_time.replace(tzinfo=ZoneInfo(user_timezone))
            return convert_to_utc(next_tz, user_timezone)
        except ValueError:
            continue

    # Fallback to next month first valid day
    next_tz = first_day_next_month.replace(hour=hour, minute=minute, second=0, microsecond=0, tzinfo=ZoneInfo(user_timezone))
    return convert_to_utc(next_tz, user_timezone)


def _calculate_next_custom(
    now_user_tz: datetime,
    hour: int,
    minute: int,
    recurrence_days: List[int],
    user_timezone: str,
) -> datetime:
    """Calculate next custom pattern trigger time (same as weekly)."""
    return _calculate_next_weekly(now_user_tz, hour, minute, recurrence_days, user_timezone)
