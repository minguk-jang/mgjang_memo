"""Timezone utilities for alarm scheduling."""

from datetime import datetime
from zoneinfo import ZoneInfo, available_timezones


def validate_timezone(tz_name: str) -> bool:
    """Validate if timezone is valid IANA format."""
    return tz_name in available_timezones()


def convert_to_user_tz(utc_dt: datetime, user_tz: str) -> datetime:
    """Convert UTC datetime to user's timezone."""
    if not validate_timezone(user_tz):
        user_tz = "UTC"

    utc_aware = utc_dt.replace(tzinfo=ZoneInfo("UTC"))
    return utc_aware.astimezone(ZoneInfo(user_tz))


def convert_to_utc(local_dt: datetime, user_tz: str) -> datetime:
    """Convert user's local datetime to UTC."""
    if not validate_timezone(user_tz):
        user_tz = "UTC"

    # Create timezone-aware datetime
    local_aware = local_dt.replace(tzinfo=ZoneInfo(user_tz))
    # Convert to UTC
    return local_aware.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
