"""Memo API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    MemoCreate,
    MemoUpdate,
    MemoResponse,
    PaginatedResponse,
)
from ..services.memo_service import MemoService
from .auth import get_current_user

router = APIRouter(prefix="/api/v1/memos", tags=["memos"])


@router.get("", response_model=PaginatedResponse)
async def list_memos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List user's memos."""
    memos, total = MemoService.list_memos(db, current_user.id, skip, limit)

    return {
        "items": [MemoResponse.from_orm(memo) for memo in memos],
        "total": total,
    }


@router.post("", response_model=MemoResponse, status_code=status.HTTP_201_CREATED)
async def create_memo(
    memo_data: MemoCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new memo."""
    memo = MemoService.create_memo(db, current_user.id, memo_data)

    return MemoResponse.from_orm(memo)


@router.get("/{memo_id}", response_model=MemoResponse)
async def get_memo(
    memo_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get memo details."""
    memo = MemoService.get_memo(db, memo_id, current_user.id)

    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memo not found",
        )

    return MemoResponse.from_orm(memo)


@router.patch("/{memo_id}", response_model=MemoResponse)
async def update_memo(
    memo_id: UUID,
    memo_data: MemoUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update memo."""
    memo = MemoService.update_memo(db, memo_id, current_user.id, memo_data)

    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memo not found",
        )

    return MemoResponse.from_orm(memo)


@router.delete("/{memo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memo(
    memo_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete memo (cascades to alarms)."""
    success = MemoService.delete_memo(db, memo_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memo not found",
        )

    return None
