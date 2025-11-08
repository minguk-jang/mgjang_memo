"""Service for memo operations."""

from uuid import UUID

from sqlalchemy.orm import Session

from ..models import Memo, User
from ..schemas import MemoCreate, MemoUpdate


class MemoService:
    """Service for CRUD operations on memos."""

    @staticmethod
    def create_memo(
        db: Session,
        user_id: UUID,
        memo_data: MemoCreate,
    ) -> Memo:
        """Create a new memo for user."""
        memo = Memo(
            user_id=user_id,
            title=memo_data.title,
            description=memo_data.description,
        )
        db.add(memo)
        db.commit()
        db.refresh(memo)
        return memo

    @staticmethod
    def get_memo(
        db: Session,
        memo_id: UUID,
        user_id: UUID,
    ) -> Memo | None:
        """Get a specific memo by ID (check ownership)."""
        return db.query(Memo).filter(
            Memo.id == memo_id,
            Memo.user_id == user_id,
        ).first()

    @staticmethod
    def list_memos(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[Memo], int]:
        """List user's memos with pagination."""
        query = db.query(Memo).filter(Memo.user_id == user_id)
        total = query.count()
        memos = query.order_by(Memo.created_at.desc()).offset(skip).limit(limit).all()
        return memos, total

    @staticmethod
    def update_memo(
        db: Session,
        memo_id: UUID,
        user_id: UUID,
        memo_data: MemoUpdate,
    ) -> Memo | None:
        """Update a memo (check ownership)."""
        memo = db.query(Memo).filter(
            Memo.id == memo_id,
            Memo.user_id == user_id,
        ).first()

        if not memo:
            return None

        if memo_data.title is not None:
            memo.title = memo_data.title
        if memo_data.description is not None:
            memo.description = memo_data.description

        db.commit()
        db.refresh(memo)
        return memo

    @staticmethod
    def delete_memo(
        db: Session,
        memo_id: UUID,
        user_id: UUID,
    ) -> bool:
        """Delete a memo (check ownership, cascades to alarms)."""
        memo = db.query(Memo).filter(
            Memo.id == memo_id,
            Memo.user_id == user_id,
        ).first()

        if not memo:
            return False

        db.delete(memo)
        db.commit()
        return True
