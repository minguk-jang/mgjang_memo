"""Service for authentication operations."""

from datetime import timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from ..models import User
from ..schemas import UserCreate
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)


class AuthService:
    """Service for user authentication and authorization."""

    @staticmethod
    def register_user(
        db: Session,
        user_data: UserCreate,
        default_timezone: str = "UTC",
    ) -> User | None:
        """Register a new user."""
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            return None  # User already exists

        # Create new user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            timezone=default_timezone,
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
    ) -> User | None:
        """Authenticate user with email and password."""
        user = db.query(User).filter(User.email == email).first()

        if not user or not verify_password(password, user.password_hash):
            return None

        return user

    @staticmethod
    def get_user(
        db: Session,
        user_id: UUID,
    ) -> User | None:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create_user_token(user: User, expires_delta: timedelta | None = None) -> str:
        """Create JWT token for user."""
        token_data = {"sub": str(user.id), "email": user.email}
        return create_access_token(token_data, expires_delta)

    @staticmethod
    def update_user_timezone(
        db: Session,
        user_id: UUID,
        timezone: str,
    ) -> User | None:
        """Update user's timezone."""
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return None

        user.timezone = timezone
        db.commit()
        db.refresh(user)
        return user
