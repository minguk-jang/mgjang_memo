"""Timezone utility functions for handling user timezones."""

from datetime import datetime
from zoneinfo import ZoneInfo, available_timezones
from typing import Optional


def validate_timezone(tz_str: str) -> bool:
    """Validate if a timezone string is valid IANA timezone."""
    return tz_str in available_timezones()


def convert_to_user_tz(utc_dt: datetime, user_timezone: str) -> datetime:
    """Convert UTC datetime to user's local timezone."""
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=ZoneInfo("UTC"))
    
    try:
        user_tz = ZoneInfo(user_timezone)
        return utc_dt.astimezone(user_tz)
    except Exception:
        # Fallback to UTC if timezone is invalid
        return utc_dt


def convert_to_utc(local_dt: datetime, user_timezone: str) -> datetime:
    """Convert local timezone datetime to UTC."""
    try:
        user_tz = ZoneInfo(user_timezone)
        if local_dt.tzinfo is None:
            local_dt = local_dt.replace(tzinfo=user_tz)
        
        return local_dt.astimezone(ZoneInfo("UTC"))
    except Exception:
        # Assume UTC if conversion fails
        return local_dt.replace(tzinfo=ZoneInfo("UTC")) if local_dt.tzinfo is None else local_dt
