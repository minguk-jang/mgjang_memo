"""FastAPI application initialization and setup."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from src.config import settings
from src.database import engine, Base
from src.scheduler import scheduler
from src.utils.logging import get_logger
from src.api import auth, memos, alarms

logger = get_logger(__name__)


# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    # Startup
    logger.info("Starting Telegram Memo Alert System")
    scheduler.start()
    
    # Add alarm checking job
    def check_alarms_job():
        from src.database import SessionLocal
        from src.services.scheduler_service import AlarmSchedulerService
        db = SessionLocal()
        try:
            AlarmSchedulerService.check_due_alarms(db)
        finally:
            db.close()
    
    scheduler.add_job(check_alarms_job, "interval", minutes=1, id="check_alarms")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Telegram Memo Alert System")
    scheduler.stop()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="A memo management system with scheduled Telegram notifications",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Include API routers
app.include_router(auth.router)
app.include_router(memos.router)
app.include_router(alarms.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
