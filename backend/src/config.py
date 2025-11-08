"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite:///./memo.db"

    # Telegram
    telegram_bot_token: str = ""
    telegram_bot_username: str = ""

    # JWT
    secret_key: str = "your-secret-key-min-32-chars-for-security-12345678"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Server
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    # Environment
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get application settings (cached)."""
    return Settings()


settings = get_settings()
