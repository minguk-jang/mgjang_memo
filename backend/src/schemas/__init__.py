"""Pydantic request/response schemas for API validation."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class AlarmType(str, Enum):
    """Alarm scheduling types."""
    NONE = "none"
    ONCE = "once"
    REPEAT = "repeat"


class RepeatInterval(str, Enum):
    """Repeat interval types."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class NotificationChannel(str, Enum):
    """Notification delivery channels."""
    NONE = "none"
    TELEGRAM = "telegram"
    EMAIL = "email"


# User Schemas
class UserCreate(BaseModel):
    """User creation request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    timezone: str = "UTC"


class UserLogin(BaseModel):
    """User login request schema."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    timezone: str
    telegram_chat_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Memo Schemas
class MemoCreate(BaseModel):
    """Memo creation request schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class MemoUpdate(BaseModel):
    """Memo update request schema."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class MemoResponse(BaseModel):
    """Memo response schema."""
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Alarm Schemas
class AlarmCreate(BaseModel):
    """Alarm creation request schema with flexible scheduling."""
    memo_id: int
    alarm_type: AlarmType = AlarmType.REPEAT
    alarm_time: Optional[datetime] = None  # For 'once' type
    repeat_interval: Optional[RepeatInterval] = None  # For 'repeat' type
    scheduled_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")  # HH:MM for repeat
    channel: NotificationChannel = NotificationChannel.TELEGRAM
    user_timezone: str = "Asia/Seoul"
    # Legacy fields for backward compatibility
    recurrence_type: Optional[str] = None
    recurrence_days: Optional[str] = None


class AlarmUpdate(BaseModel):
    """Alarm update request schema."""
    alarm_type: Optional[AlarmType] = None
    alarm_time: Optional[datetime] = None
    repeat_interval: Optional[RepeatInterval] = None
    scheduled_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    channel: Optional[NotificationChannel] = None
    enabled: Optional[bool] = None
    # Legacy fields
    recurrence_type: Optional[str] = None
    recurrence_days: Optional[str] = None


class AlarmResponse(BaseModel):
    """Alarm response schema."""
    id: int
    memo_id: int
    alarm_type: str
    alarm_time: Optional[datetime] = None
    repeat_interval: Optional[str] = None
    scheduled_time: Optional[str] = None
    channel: str
    # Legacy fields
    recurrence_type: Optional[str] = None
    recurrence_days: Optional[str] = None
    next_trigger_time: Optional[datetime] = None
    last_triggered: Optional[datetime] = None
    enabled: bool
    user_timezone: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Alarm History Schemas
class AlarmHistoryResponse(BaseModel):
    """Alarm history response schema."""
    id: int
    alarm_id: int
    triggered_at: datetime
    delivery_status: str
    error_message: Optional[str] = None
    retry_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Telegram Schemas
class TelegramLinkingCodeResponse(BaseModel):
    """Telegram linking code response."""
    code: str
    expires_at: datetime


class TelegramUnlinkRequest(BaseModel):
    """Telegram unlink request."""
    pass
