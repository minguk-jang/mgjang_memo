"""Service for memo management."""

from sqlalchemy.orm import Session
from src.models import Memo, User
from src.schemas import MemoCreate, MemoUpdate
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class MemoService:
    """Service for memo operations."""
    
    @staticmethod
    def create_memo(db: Session, user_id: int, memo_data: MemoCreate) -> Memo:
        """Create a new memo for a user."""
        memo = Memo(
            user_id=user_id,
            title=memo_data.title,
            description=memo_data.description
        )
        db.add(memo)
        db.commit()
        db.refresh(memo)
        logger.info(f"Memo created: {memo.id} for user {user_id}")
        return memo
    
    @staticmethod
    def get_memo(db: Session, memo_id: int, user_id: int) -> Optional[Memo]:
        """Get a specific memo by ID (only if user owns it)."""
        return db.query(Memo).filter(
            Memo.id == memo_id,
            Memo.user_id == user_id
        ).first()
    
    @staticmethod
    def list_memos(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Memo]:
        """List all memos for a user."""
        return db.query(Memo).filter(
            Memo.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_memo(db: Session, memo_id: int, user_id: int, memo_data: MemoUpdate) -> Optional[Memo]:
        """Update a memo (only if user owns it)."""
        memo = MemoService.get_memo(db, memo_id, user_id)
        if not memo:
            return None
        
        if memo_data.title is not None:
            memo.title = memo_data.title
        if memo_data.description is not None:
            memo.description = memo_data.description
        
        db.commit()
        db.refresh(memo)
        logger.info(f"Memo updated: {memo.id}")
        return memo
    
    @staticmethod
    def delete_memo(db: Session, memo_id: int, user_id: int) -> bool:
        """Delete a memo (only if user owns it). Cascades to alarms."""
        memo = MemoService.get_memo(db, memo_id, user_id)
        if not memo:
            return False
        
        db.delete(memo)
        db.commit()
        logger.info(f"Memo deleted: {memo_id}")
        return True
