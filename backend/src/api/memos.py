"""Memo API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.database import get_db
from src.schemas import MemoCreate, MemoUpdate, MemoResponse
from src.services.memo_service import MemoService
from src.middleware.auth import get_current_user
from src.models import User

router = APIRouter(prefix="/api/v1/memos", tags=["Memos"])


@router.post("", response_model=MemoResponse, status_code=201)
async def create_memo(
    memo_data: MemoCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new memo."""
    memo = MemoService.create_memo(db, current_user["user_id"], memo_data)
    return memo


@router.get("", response_model=List[MemoResponse])
async def list_memos(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List memos for authenticated user."""
    memos = MemoService.list_memos(db, current_user["user_id"], skip, limit)
    return memos


@router.get("/{memo_id}", response_model=MemoResponse)
async def get_memo(
    memo_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific memo."""
    memo = MemoService.get_memo(db, memo_id, current_user["user_id"])
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    return memo


@router.patch("/{memo_id}", response_model=MemoResponse)
async def update_memo(
    memo_id: int,
    memo_data: MemoUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a memo."""
    memo = MemoService.update_memo(db, memo_id, current_user["user_id"], memo_data)
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    return memo


@router.delete("/{memo_id}", status_code=204)
async def delete_memo(
    memo_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a memo."""
    if not MemoService.delete_memo(db, memo_id, current_user["user_id"]):
        raise HTTPException(status_code=404, detail="Memo not found")
    return None
