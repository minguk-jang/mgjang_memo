# Quick Start Guide: Telegram Memo Alert System

**Purpose**: Get the development environment running locally for testing and development

**Prerequisites**:
- Python 3.9+
- Node.js 16+
- PostgreSQL 12+ (or SQLite for development)
- Git
- Telegram Bot Token (create via @BotFather on Telegram)

---

## Project Setup

### Clone and Navigate

```bash
git clone <repo-url>
cd mgjang_memo
```

### Directory Structure

```
mgjang_memo/
├── backend/              # Python FastAPI backend
├── frontend/             # React frontend
├── specs/                # Documentation
└── docs/                 # Additional documentation
```

---

## Backend Setup (FastAPI + APScheduler)

### 1. Create Python Virtual Environment

```bash
cd backend
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Key dependencies**:
- `fastapi==0.109.0`
- `uvicorn==0.27.0`
- `sqlalchemy==2.0.0`
- `psycopg2-binary==2.9.0` (PostgreSQL) or sqlite3 (built-in)
- `apscheduler==3.10.0`
- `python-telegram-bot==20.0`
- `python-jose==3.3.0` (JWT tokens)
- `passlib==1.7.4` (password hashing)
- `pydantic==2.0.0`
- `pydantic-settings==2.0.0`

### 3. Configure Environment

Create `.env` file in `backend/`:

```env
# Database
DATABASE_URL=sqlite:///./memo.db
# Or PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/memo_db

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username

# JWT
SECRET_KEY=your-secret-key-min-32-chars-for-security
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Server
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=True
```

### 4. Initialize Database

```bash
# Create tables (using SQLAlchemy models)
python -c "from src.models import Base; from src.database import engine; Base.metadata.create_all(bind=engine)"

# Or with Alembic migrations (if implemented)
alembic upgrade head
```

### 5. Run Backend Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
INFO:     APScheduler started
```

### 6. Test Backend Health

```bash
curl http://localhost:8000/health
# Response: {"status": "ok"}
```

---

## Frontend Setup (React)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

**Key dependencies**:
- `react==18.2.0`
- `react-router-dom==6.20.0`
- `axios==1.6.0` (API client)
- `date-fns==2.30.0` (date handling)
- `zustand==4.4.0` or `jotai==2.4.0` (state management)

### 2. Configure Environment

Create `.env` file in `frontend/`:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_TELEGRAM_BOT_USERNAME=your_bot_username
```

### 3. Start Development Server

```bash
npm start
```

**Expected output**:
```
Compiled successfully!
You can now view the app in the browser.
  Local:            http://localhost:3000
```

---

## User Flow Testing

### 1. Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Response**:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "timezone": "UTC",
    "telegram_linked": false
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 2. Update Timezone

```bash
curl -X POST http://localhost:8000/api/v1/auth/update-timezone \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "Asia/Seoul"
  }'
```

### 3. Create Memo

```bash
curl -X POST http://localhost:8000/api/v1/memos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily standup",
    "description": "Team sync meeting every morning"
  }'
```

**Response**:
```json
{
  "id": "memo-uuid",
  "user_id": "user-uuid",
  "title": "Daily standup",
  "description": "Team sync meeting every morning",
  "next_alarm_time": null,
  "created_at": "2025-11-08T10:00:00Z",
  "updated_at": "2025-11-08T10:00:00Z"
}
```

### 4. Create Alarm for Memo

```bash
curl -X POST http://localhost:8000/api/v1/alarms \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "memo_id": "memo-uuid-from-step-3",
    "scheduled_time": "09:00",
    "recurrence_type": "daily"
  }'
```

**Response**:
```json
{
  "id": "alarm-uuid",
  "memo_id": "memo-uuid",
  "scheduled_time": "09:00",
  "recurrence_type": "daily",
  "recurrence_days": null,
  "next_trigger_time": "2025-11-09T00:00:00Z",
  "enabled": true,
  "created_at": "2025-11-08T10:00:00Z"
}
```

### 5. Generate Telegram Linking Code

```bash
curl -X POST http://localhost:8000/api/v1/telegram/linking-code \
  -H "Authorization: Bearer {token}"
```

**Response**:
```json
{
  "code": "ABC123XYZ",
  "expires_at": "2025-11-08T10:10:00Z"
}
```

**Next**: User sends `/link ABC123XYZ` to Telegram bot

### 6. View Alarm History

```bash
curl -X GET "http://localhost:8000/api/v1/history/alarm-uuid-from-step-4" \
  -H "Authorization: Bearer {token}"
```

**Response** (after alarm triggers):
```json
{
  "items": [
    {
      "id": "history-uuid",
      "alarm_id": "alarm-uuid",
      "triggered_at": "2025-11-09T00:00:15Z",
      "delivery_status": "sent",
      "error_message": null,
      "retry_count": 0,
      "created_at": "2025-11-09T00:00:15Z"
    }
  ],
  "total": 1
}
```

---

## Testing Telegram Integration Locally

### 1. Set Up Telegram Bot

- Chat with @BotFather on Telegram
- Create new bot: `/newbot`
- Get bot token and username
- Add to `.env`: `TELEGRAM_BOT_TOKEN=...`

### 2. Configure Webhook (or Polling for local testing)

**Option A: Polling** (simpler for local testing)
```python
# In src/telegram_bot.py
# Use polling instead of webhook
app.telegram_client.start_polling()
```

**Option B: Webhook** (for production)
```python
# Backend must expose /webhook/telegram endpoint
# Configure in Telegram Bot settings
```

### 3. Test Bot Linking

1. Start bot in development mode
2. Send `/start` to bot → Bot responds with hello message
3. In app, generate linking code
4. Send `/link ABC123XYZ` to bot
5. Bot confirms: "Account linked!"
6. Check dashboard: Telegram should show as linked

### 4. Test Alarm Notification

1. Create memo + alarm for 1 minute from now
2. Wait for APScheduler to trigger alarm
3. Check Telegram DM from bot for notification
4. Check dashboard alarm history for delivery status

---

## Debugging Tips

### Check Backend Logs

```bash
# Watch APScheduler logs
tail -f logs/scheduler.log

# Watch API request logs
# Enabled with ENVIRONMENT=development
```

### Test API with Postman

1. Import `contracts/api.openapi.yaml` into Postman
2. Set variables: `{{base_url}}`, `{{token}}`
3. Run requests sequentially

### Common Issues

**Issue**: `CORS error` when frontend calls backend
- **Fix**: Check `CORS_ORIGINS` in backend `.env`
- Ensure frontend URL is in allowed origins

**Issue**: Alarm not triggering at scheduled time
- **Fix**: Check APScheduler job in logs
- Verify timezone conversion (user timezone vs UTC)
- Check database: `SELECT * FROM alarms ORDER BY next_trigger_time`

**Issue**: Telegram message not received
- **Fix**: Verify `TELEGRAM_BOT_TOKEN` is correct
- Check `telegram_chat_id` is set in user profile
- Test Telegram API directly:
  ```bash
  curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
    -d "chat_id={CHAT_ID}&text=Test"
  ```

**Issue**: Database migrations failing
- **Fix**: Drop all tables and recreate (dev only):
  ```bash
  python -c "from src.models import Base; from src.database import engine; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
  ```

---

## Frontend Testing Checklist

- [ ] Login/Register form works
- [ ] Create memo displays in list
- [ ] Edit memo updates correctly
- [ ] Delete memo removes from list
- [ ] Create alarm for memo
- [ ] Select daily recurrence
- [ ] Select weekly with specific days
- [ ] Select monthly recurrence
- [ ] Custom pattern with visual selector works
- [ ] View alarm history shows recent triggers
- [ ] Timezone displays correctly
- [ ] Telegram linking code shows
- [ ] Send linking code to bot
- [ ] Telegram link status updates in dashboard

---

## Backend Testing Checklist

- [ ] All API endpoints return correct status codes
- [ ] JWT token authentication works
- [ ] Database CRUD operations persist
- [ ] APScheduler checks alarms every minute
- [ ] Telegram notifications send successfully
- [ ] Timezone conversion calculates correctly
- [ ] Alarm history records triggers
- [ ] Failed Telegram messages retry correctly
- [ ] User can create 100+ memos without slowdown
- [ ] Concurrent requests handled properly

---

## Deployment Preview

### Backend Deployment (Render.com)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect repo to Render.com
# Dashboard → New → Web Service → GitHub

# 3. Configure:
# - Build Command: pip install -r requirements.txt
# - Start Command: uvicorn src.main:app --host 0.0.0.0 --port 8000
# - Environment: Set .env variables in Render dashboard

# 4. Deploy
# Render auto-deploys on push to main
```

### Frontend Deployment (GitHub Pages)

```bash
# 1. Update REACT_APP_API_BASE_URL to production backend
# frontend/.env.production

# 2. Build
npm run build

# 3. Deploy to GitHub Pages
npm run deploy

# Or manual:
git add build/
git commit -m "Deploy frontend"
git push origin gh-pages
```

---

## Next Steps

1. **Complete backend implementation** (models, services, API routes)
2. **Implement frontend components** (memo form, list, alarm settings)
3. **Test Telegram integration** in development
4. **Load testing**: Test with 10k concurrent alarms
5. **Deploy to production** (Render.com + GitHub Pages)
6. **Monitor** alarm accuracy and Telegram delivery rate

---

## Documentation Links

- [API Documentation](contracts/api.openapi.yaml)
- [Data Model](data-model.md)
- [Architecture & Design](research.md)
- [Specification](spec.md)

