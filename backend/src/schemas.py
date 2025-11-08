"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# User Schemas
class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr


class UserCreate(UserBase):
    """User creation schema."""

    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """User login schema."""

    email: EmailStr
    password: str


class UserTimezone(BaseModel):
    """Update user timezone schema."""

    timezone: str


class UserResponse(UserBase):
    """User response schema."""

    id: UUID
    timezone: str
    telegram_linked: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Memo Schemas
class MemoBase(BaseModel):
    """Base memo schema."""

    title: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=2000)


class MemoCreate(MemoBase):
    """Memo creation schema."""

    pass


class MemoUpdate(BaseModel):
    """Memo update schema."""

    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)


class MemoResponse(MemoBase):
    """Memo response schema."""

    id: UUID
    user_id: UUID
    next_alarm_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Alarm Schemas
class AlarmBase(BaseModel):
    """Base alarm schema."""

    scheduled_time: str = Field(..., pattern=r"^([0-1][0-9]|2[0-3]):[0-5][0-9]$")  # HH:MM
    recurrence_type: str = Field(..., pattern="^(daily|weekly|monthly|custom)$")
    recurrence_days: Optional[List[int]] = None


class AlarmCreate(AlarmBase):
    """Alarm creation schema."""

    memo_id: UUID


class AlarmUpdate(BaseModel):
    """Alarm update schema."""

    scheduled_time: Optional[str] = Field(None, pattern=r"^([0-1][0-9]|2[0-3]):[0-5][0-9]$")
    recurrence_type: Optional[str] = Field(None, pattern="^(daily|weekly|monthly|custom)$")
    recurrence_days: Optional[List[int]] = None
    enabled: Optional[bool] = None


class AlarmResponse(AlarmBase):
    """Alarm response schema."""

    id: UUID
    memo_id: UUID
    next_trigger_time: datetime
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# AlarmHistory Schemas
class AlarmHistoryResponse(BaseModel):
    """Alarm history response schema."""

    id: UUID
    alarm_id: UUID
    triggered_at: datetime
    delivery_status: str
    error_message: Optional[str] = None
    retry_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Telegram Schemas
class TelegramLinkingCodeResponse(BaseModel):
    """Telegram linking code response schema."""

    code: str
    expires_at: datetime


class PaginationParams(BaseModel):
    """Pagination parameters."""

    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=100)


class PaginatedResponse(BaseModel):
    """Generic paginated response."""

    items: List
    total: int
