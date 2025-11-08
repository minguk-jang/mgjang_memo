# Research: Telegram Memo Alert System

**Date**: 2025-11-08
**Feature**: Telegram Memo Alert System
**Purpose**: Resolve technical unknowns and establish best practices for implementation

---

## 1. User Authentication Strategy

### Decision
**OAuth2 + JWT tokens** with Telegram Bot linking pattern:
1. User creates account on dashboard (email/password or social auth)
2. User initiates Telegram linking: dashboard generates unique linking code
3. User sends `/link [code]` to Telegram bot
4. Bot verifies code and stores user's Telegram ID linked to account
5. Dashboard stores Telegram Chat ID in user profile
6. All notifications sent to linked Telegram Chat ID

### Rationale
- Decouples Telegram identity from dashboard identity (users can link/unlink)
- Telegram Bot API sends messages to Chat ID (not username)
- JWT tokens enable stateless backend and work well with static frontend
- Linking code pattern is common and secure (short-lived, one-time use)

### Alternatives Considered
- **Telegram Login Widget**: Would require users to login via Telegram only. Rejected because:
  - Limits users without active Telegram
  - Less flexible for future auth options (email, social)
  - Still need to link Telegram Chat ID for notification delivery
- **Simple email/password linking**: Rejected because:
  - Less secure than OAuth2
  - Doesn't scale to mobile apps later
  - Telegram Bot already provides secure linking mechanism

---

## 2. Database Choice: PostgreSQL vs SQLite

### Decision
**PostgreSQL** (with SQLite as development fallback)

### Rationale for PostgreSQL
- **Scale**: Supports 10,000+ concurrent memos efficiently
- **Concurrency**: Better handling of multiple scheduler processes (if needed for horizontal scaling)
- **Query Performance**: JSON/JSONB columns for flexible alarm patterns, superior indexing for time-based queries
- **Reliability**: Built-in replication, backup strategies important for notification system
- **Render.com Compatibility**: Native support for PostgreSQL, easy provisioning

For Development: SQLite acceptable for local testing (schema compatible via SQLAlchemy)

### Performance Considerations
- **Indexes needed**:
  - `alarms(next_trigger_time)` - fast lookup for due alarms
  - `alarms(user_id)` - fetch user's alarms
  - `memos(user_id, created_at)` - user's memos chronologically
- **Query Pattern**: "Find all alarms due in next minute" runs every minute
  - WITH timezone conversion: ~O(n) full scan optimized by index on next_trigger_time
  - Caching last-checked timestamp reduces repeated queries

### Connection Pooling
- Use SQLAlchemy connection pooling (pool_size=20, max_overflow=10) for FastAPI
- Render.com PostgreSQL: up to 20 concurrent connections sufficient for single backend instance

---

## 3. Timezone Handling Library

### Decision
**Python `zoneinfo` module** (Python 3.9+) with browser timezone detection

### Rationale
- **zoneinfo (PEP 615)**: Standard library since Python 3.9
  - No external dependencies (unlike pytz which can be complex)
  - Direct support for IANA timezone database
  - Better DST handling, cleaner API
- **Browser-side Detection**: JavaScript's `Intl` API or `moment-timezone`
  - Detect user's timezone from browser: `Intl.DateTimeFormat().resolvedOptions().timeZone`
  - Send to backend when creating memo
  - Backend stores user's timezone in profile (can be overridden)

### Implementation Pattern
```
Frontend:
  1. Detect timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  2. Send in API request: { title, time: "09:00", timezone: "Asia/Seoul" }
  3. Display uses browser's local time

Backend:
  1. Receive time + timezone
  2. Convert to UTC for storage: datetime.fromisoformat(time)
                                .replace(tzinfo=ZoneInfo(tz))
                                .astimezone(ZoneInfo('UTC'))
  3. Store next_trigger_time as UTC timestamp
  4. At alarm check: compare UTC clock time to all next_trigger_time values
  5. Retry: recalculate next occurrence using ZoneInfo for user's timezone
```

### Alternatives Considered
- **pytz**: Complex DST handling, often buggy with arithmetic
- **Arrow**: External dependency, slower than zoneinfo
- **Fixed server timezone only**: Rejected - confusing UX, requires manual conversion

---

## 4. Telegram Retry Logic & Failure Handling

### Decision
**Exponential backoff with 3 retries** + Queue persistence

### Retry Strategy
```
Attempt 1: Immediate send (T+0)
Attempt 2: Wait 5 seconds, retry (T+5)
Attempt 3: Wait 30 seconds, retry (T+35)
Attempt 4: Wait 5 minutes, retry (T+335)
Max retries: 3

After 3 failures:
  - Mark AlarmHistory.status = "failed"
  - Log error with reason (rate limit, network, API error)
  - Stop retrying (don't spam Telegram API)
  - User sees status in dashboard
```

### Rate Limiting Handling
- Telegram Bot API limit: ~30 messages/second per bot
- For reasonable user load: not an issue, but queue design prevents hammering
- If 429 (Too Many Requests): exponential backoff respects Retry-After header

### Database Persistence
- **DeliveryQueue table**:
  - alarm_id, user_id, message_content, next_retry_time, attempt_count
  - Scheduler checks queue every minute alongside alarm checks
  - Ensures messages aren't lost if service restarts

### Graceful Degradation
- Telegram unavailable → messages queued, delivered when available
- User can still create/edit memos normally
- No cascading failures to database or dashboard

### Alternatives Considered
- **No retries**: Rejected - poor UX, users miss important reminders
- **Infinite retries**: Rejected - can cause queue buildup, spam risk
- **In-memory queue**: Rejected - data loss on restart
- **External queue service (Redis/RabbitMQ)**: Overkill for current scale

---

## 5. GitHub Pages + External API (CORS) Configuration

### Decision
**Backend CORS headers** + **API Gateway pattern**

### CORS Configuration
Backend (`FastAPI`) must allow requests from GitHub Pages domain:
```python
CORSMiddleware(
    app,
    allow_origins=[
        "https://username.github.io",  # or custom domain
        "http://localhost:3000"         # dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### Authentication Flow (Critical for CORS)
- Frontend stores JWT in localStorage or sessionStorage
- Every API request includes: `Authorization: Bearer {token}`
- Backend validates token in middleware
- CORS + Auth prevents CSRF attacks

### API Gateway Considerations
- **Direct API calls allowed**: Frontend can call backend directly (no proxy needed)
- **Render.com URL**: e.g., `https://memo-backend-production.onrender.com`
- **Custom domain possible**: Point DNS to Render backend (optional)
- **Error handling**: Network errors, timeouts, CORS failures handled gracefully in frontend

### Deployment Checklist
- Set `BACKEND_URL` environment variable in GitHub Pages build
- Frontend build includes backend URL (injected at build time or runtime)
- Backend CORS origins list includes exact GitHub Pages domain
- JWT refresh token mechanism for long sessions

### Alternatives Considered
- **Proxy all requests through GitHub Pages**: Not possible (static only)
- **Same-origin server**: Rejects architecture (frontend + backend separation)
- **Public API without auth**: Rejected - security risk (anyone can create/delete memos)

---

## 6. Alarm Scheduling Architecture

### Decision
**APScheduler with database-backed job store**

### Implementation Pattern
```python
# Backend startup
scheduler = BackgroundScheduler(
    jobstore='sqlalchemy',           # Persist to DB
    job_defaults={'coalesce': True}, # Don't backfill missed triggers
    timezone='UTC'
)

# Add job for checking alarms
scheduler.add_job(
    check_and_send_alarms,
    'interval',
    minutes=1,
    id='alarm_checker'
)

def check_and_send_alarms():
    now_utc = datetime.now(timezone.utc)
    due_alarms = db.query(Alarm).filter(
        Alarm.next_trigger_time <= now_utc,
        Alarm.enabled == True
    ).all()

    for alarm in due_alarms:
        send_telegram_notification(alarm)
        alarm.last_triggered = now_utc
        alarm.next_trigger_time = calculate_next_occurrence(alarm)
    db.commit()
```

### Job Store Considerations
- **Database-backed**: Survives process restarts, works with multiple scheduler instances
- **Timezone handling**: APScheduler uses timezone parameter, keep in UTC
- **Coalesce**: True = skip missed runs if server down, don't backfill

### Considerations for Scale
- Single scheduler instance sufficient for 10k alarms (1 check/minute)
- If horizontal scaling needed: distribute alarm ranges by user_id (advanced)
- Current approach: Render.com free tier runs single process (acceptable)

---

## 7. Alarm Recurrence Pattern Storage

### Decision
**Simple fields + calculation on update**

### Pattern Storage Schema
```sql
CREATE TABLE alarms (
    id PRIMARY KEY,
    memo_id FOREIGN KEY,
    scheduled_time TIME,              -- 09:00 (24h format)
    recurrence_type VARCHAR,          -- 'daily', 'weekly', 'monthly', 'custom'
    recurrence_days JSON,             -- [0,1,2,3,4,5,6] for weekly, or [1..28] for monthly
    custom_days BOOLEAN,              -- True if user used visual selector
    next_trigger_time TIMESTAMP,      -- Pre-calculated, stored for fast lookup
    last_triggered TIMESTAMP,
    user_timezone VARCHAR,            -- 'Asia/Seoul'
    enabled BOOLEAN
);
```

### Custom Pattern (Visual Selector)
Frontend sends:
```json
{
  "recurrence_type": "custom",
  "recurrence_days": [1, 3, 5],  // Monday, Wednesday, Friday (0=Sunday)
  "scheduled_time": "09:00"
}
```

Backend calculates `next_trigger_time` based on:
1. Current time in user's timezone
2. Selected days + time
3. Find next matching day/time combination

### Calculation Logic
```python
def calculate_next_occurrence(alarm):
    user_tz = ZoneInfo(alarm.user_timezone)
    now = datetime.now(user_tz)
    scheduled_time = datetime.strptime(alarm.scheduled_time, "%H:%M").time()

    if alarm.recurrence_type == 'daily':
        next_time = now.replace(hour=scheduled_time.hour, minute=scheduled_time.minute, second=0)
        if next_time <= now:
            next_time += timedelta(days=1)
    elif alarm.recurrence_type == 'weekly':
        days_ahead = get_days_ahead(alarm.recurrence_days, now.weekday())
        next_time = now + timedelta(days=days_ahead)
        next_time = next_time.replace(hour=scheduled_time.hour, minute=scheduled_time.minute, second=0)
    # ... etc for monthly, custom

    return next_time.astimezone(timezone.utc)  # Store in UTC
```

---

## 8. Frontend State Management

### Decision
**React Context API + Custom Hooks** (no Redux needed for current scope)

### State Structure
```typescript
interface MemoState {
  memos: Memo[];
  selectedMemo: Memo | null;
  alarmHistory: AlarmHistory[];
  loading: boolean;
  error: string | null;
}

interface Memo {
  id: string;
  title: string;
  description: string;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
  scheduledTime: string; // "09:00"
  recurrenceDays?: number[]; // [0,1,2,3,4,5,6]
  nextAlarmTime: string; // ISO datetime
  createdAt: string;
  updatedAt: string;
}
```

### Custom Hooks
- `useMemos()`: fetch/create/update/delete memos
- `useAlarmHistory(memoId)`: fetch history for a specific memo
- `useAuth()`: login, logout, token management
- `useTimezone()`: detect browser timezone, manage user timezone

### Why Context over Redux
- Current feature is CRUD-focused, not complex data flow
- Context sufficient for authentication + memo state
- Reduces boilerplate, smaller bundle
- Can upgrade to Redux later if needed

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **Auth** | OAuth2 + JWT + Telegram linking | Flexible, secure, user-friendly |
| **Database** | PostgreSQL (SQLite for dev) | Scalable, reliable, Render.com native |
| **Timezone** | zoneinfo (Python) + browser detection | Standard lib, no deps, accurate DST |
| **Retries** | Exponential backoff (3 retries) + queue | Balances reliability vs API limits |
| **CORS** | Backend headers + JWT auth | Direct API calls, secure |
| **Scheduler** | APScheduler with DB job store | Persistent, restartable, simple |
| **Patterns** | Simple fields + calculation | Flexible, no complex parsing |
| **Frontend State** | Context API + Custom hooks | Lightweight, maintainable |

---

## Risk Mitigation

### Identified Risks

1. **Timezone Bugs**: Daylight Saving Time edge cases
   - Mitigation: Comprehensive unit tests for DST transitions
   - Use zoneinfo (modern, correct handling)

2. **Telegram API Outages**: Notifications delayed indefinitely
   - Mitigation: Persistent queue, user sees status in dashboard
   - Retry logic with limits prevents spam

3. **Database Performance**: "Find due alarms" query at scale
   - Mitigation: Index on `next_trigger_time`, caching mechanism
   - Monitor performance with 10k test data

4. **GitHub Pages + API CORS**: Browsers block requests
   - Mitigation: Test CORS headers in development
   - Proper error messages guide user to backend issue

5. **Lost Messages on Restart**: Queue in-memory
   - Mitigation: Database-backed queue table
   - Persistent storage survives restarts

