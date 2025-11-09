# Deployment Guide

## Backend Deployment (Render.com)

1. Connect Git repository to Render
2. Create PostgreSQL database
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SECRET_KEY`: Random secure key
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `CORS_ORIGINS`: Frontend URL
4. Deploy from `backend` directory

## Frontend Deployment (GitHub Pages)

1. Update `VITE_API_BASE_URL` in `.env.local` to production backend
2. Configure repository settings for GitHub Pages
3. GitHub Actions workflow automatically deploys on push to main

## Environment Setup

### Backend .env
```
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
CORS_ORIGINS=["https://yourusername.github.io"]
```

### Frontend .env.local
```
VITE_API_BASE_URL=https://your-api-domain.com
```

## Post-Deployment

1. Run database migrations
2. Create Telegram bot via @BotFather
3. Test linking flow with test bot
4. Monitor logs for any issues
