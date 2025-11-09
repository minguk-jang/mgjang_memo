"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from src.utils.security import hash_password, verify_password, create_access_token
from src.models import User
import httpx
import os
from pydantic import BaseModel
from typing import Any, Optional

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


class GitHubAuthRequest(BaseModel):
    """GitHub authentication request."""
    code: str


class GitHubAuthResponse(BaseModel):
    """GitHub authentication response."""
    access_token: str
    token_type: str
    user: UserResponse


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        timezone=user_data.timezone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create access token
    token = create_access_token(data={"sub": user.email, "user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/github", response_model=GitHubAuthResponse)
async def github_login(auth_request: GitHubAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with GitHub OAuth code.
    Exchange the GitHub OAuth code for an access token and user info.
    """
    github_client_id = os.getenv("GITHUB_CLIENT_ID")
    github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")

    if not github_client_id or not github_client_secret:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth not configured"
        )

    # Exchange code for GitHub access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": github_client_id,
                "client_secret": github_client_secret,
                "code": auth_request.code,
            }
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to exchange GitHub code for token"
            )

        token_data = token_response.json()
        github_access_token = token_data.get("access_token")

        if not github_access_token:
            raise HTTPException(
                status_code=400,
                detail="No access token received from GitHub"
            )

        async def fetch_verified_github_email(access_token: str) -> Optional[str]:
            """Retrieve the best email candidate from GitHub when profile email is missing."""
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
            )

            if email_response.status_code != 200:
                return None

            emails: Any = email_response.json()
            if not isinstance(emails, list):
                return None

            def pick_email(predicate) -> Optional[str]:
                for entry in emails:
                    if not isinstance(entry, dict):
                        continue
                    if predicate(entry) and entry.get("email"):
                        return entry["email"]
                return None

            # Prefer primary+verified first, then any verified, then anything we get.
            return (
                pick_email(lambda e: e.get("primary") and e.get("verified"))
                or pick_email(lambda e: e.get("verified"))
                or pick_email(lambda e: bool(e.get("email")))
            )

        # Get GitHub user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/json"
            }
        )

        if user_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to fetch GitHub user info"
            )

        github_user = user_response.json()
        github_id = str(github_user["id"])
        github_login = github_user["login"]
        github_email = github_user.get("email")

        if not github_email:
            github_email = await fetch_verified_github_email(github_access_token)

        github_email = github_email or f"{github_login}@github.user"

    # Find or create user
    user = db.query(User).filter(User.email == github_email).first()

    if not user:
        # Create new user from GitHub info
        user = User(
            email=github_email,
            password_hash="",  # No password for GitHub users
            timezone="UTC"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create JWT access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
