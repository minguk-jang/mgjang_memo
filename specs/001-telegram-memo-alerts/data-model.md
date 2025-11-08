# Data Model: Telegram Memo Alert System

**Date**: 2025-11-08
**Purpose**: Define database schema, entities, relationships, and validation rules

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ id (PK)          │
│ email            │
│ password_hash    │
│ telegram_chat_id │
│ timezone         │
│ created_at       │
│ updated_at       │
└────────┬─────────┘
         │ 1
         │ (owns)
         │ ∞
┌────────▼──────────┐              ┌──────────────────┐
│       Memo        │─────────────▶│     Alarm        │
├──────────────────┤│ 1          ∞├──────────────────┤
│ id (PK)          ││              │ id (PK)          │
│ user_id (FK)     ││              │ memo_id (FK)     │
│ title            ││              │ scheduled_time   │
│ description      ││              │ recurrence_type  │
│ created_at       ││              │ recurrence_days  │
│ updated_at       ││              │ next_trigger_time│
└──────────────────┘│              │ last_triggered   │
                    │              │ user_timezone    │
                    │              │ enabled          │
                    │              │ created_at       │
                    │              └────────┬─────────┘
                    │                       │ 1
                    │                       │ (has)
                    │                       │ ∞
                    │         ┌─────────────▼──────────┐
                    └────────▶│   AlarmHistory         │
                      1     ∞ ├────────────────────────┤
                              │ id (PK)                │
                              │ alarm_id (FK)          │
                              │ triggered_at           │
                              │ delivery_status        │
                              │ error_message          │
                              │ retry_count            │
                              └────────────────────────┘

Optional Tables:

┌────────────────────────┐
│   DeliveryQueue        │
├────────────────────────┤
│ id (PK)                │
│ alarm_id (FK)          │
│ user_id (FK)           │
│ message_content        │
│ next_retry_time        │
│ attempt_count          │
│ last_error             │
│ created_at             │
└────────────────────────┘

┌────────────────────────┐
│   TelegramLinkingCode  │
├────────────────────────┤
│ code (PK)              │
│ user_id (FK)           │
│ created_at             │
│ expires_at             │
│ used (boolean)         │
└────────────────────────┘
```

---

## Entity Definitions

### 1. User

**Purpose**: Store user account information and Telegram linking

**Fields**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_chat_id BIGINT UNIQUE,              -- Telegram user's chat ID (can be NULL if not linked)
    timezone VARCHAR(50) DEFAULT 'UTC',          -- User's selected timezone (IANA format)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints**:
- `email`: Valid email format, unique per system
- `password_hash`: bcrypt or argon2 hashed, never stored plaintext
- `telegram_chat_id`: Optional (user can create account without Telegram), but required to receive notifications
- `timezone`: Must be valid IANA timezone (e.g., 'Asia/Seoul', 'America/New_York')

**Validation Rules**:
- Email must match RFC 5322 standard (basic validation sufficient)
- Password: minimum 8 characters, complexity not enforced (user responsibility)
- Telegram Chat ID must be valid integer (provided by Telegram Bot API)

**State Transitions**:
- Created: email + password set
- Linked: telegram_chat_id populated (after user completes linking flow)
- Unlinked: telegram_chat_id set to NULL (user can unlink Telegram)

---

### 2. Memo

**Purpose**: Store user's task/reminder content

**Fields**:
```sql
CREATE TABLE memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_memos_user_id (user_id),
    INDEX idx_memos_created_at (user_id, created_at DESC)
);
```

**Constraints**:
- `user_id`: Foreign key to `users`, cascade delete
- `title`: Required, max 255 characters, trimmed whitespace
- `description`: Optional, max 2000 characters

**Validation Rules**:
- Title: non-empty after trim
- Description: optional, but if provided max 2000 chars
- User must own memo (query checks user_id matches authenticated user)

**Deletion Cascade**:
- When memo deleted: all associated alarms and alarm history deleted
- When user deleted: all memos, alarms, history deleted

---

### 3. Alarm

**Purpose**: Store scheduled alarm configuration and next trigger calculation

**Fields**:
```sql
CREATE TABLE alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memo_id UUID NOT NULL REFERENCES memos(id) ON DELETE CASCADE,

    -- Scheduling
    scheduled_time VARCHAR(5) NOT NULL,          -- HH:MM format (24-hour)
    recurrence_type VARCHAR(20) NOT NULL,        -- 'daily', 'weekly', 'monthly', 'custom'
    recurrence_days TEXT,                        -- JSON: [0,1,2,3,4,5,6] for weekly, or [1..31] for monthly, or [0,2,4] for custom
    user_timezone VARCHAR(50) NOT NULL,          -- User's timezone for this alarm

    -- Execution tracking
    next_trigger_time TIMESTAMP NOT NULL,        -- Pre-calculated, stored as UTC
    last_triggered TIMESTAMP,                    -- When alarm last fired
    enabled BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_alarms_next_trigger (next_trigger_time),
    INDEX idx_alarms_memo_id (memo_id),
    INDEX idx_alarms_enabled (enabled, next_trigger_time)
);
```

**Constraints**:
- `memo_id`: Foreign key to `memos`, cascade delete
- `scheduled_time`: Valid HH:MM format (00:00 to 23:59)
- `recurrence_type`: Enum (daily, weekly, monthly, custom)
- `recurrence_days`: JSON array
  - For 'daily': empty or null
  - For 'weekly': [0..6] (0=Sunday, 6=Saturday)
  - For 'monthly': [1..31] (day of month)
  - For 'custom': [0..6] for custom days selection
- `user_timezone`: Must be valid IANA timezone
- `next_trigger_time`: Always stored in UTC, calculated when alarm created/updated
- `enabled`: Soft-delete mechanism (disable instead of delete to preserve history)

**Validation Rules**:
- Scheduled time format: must be valid HH:MM (regex: `^([0-1][0-9]|2[0-3]):[0-5][0-9]$`)
- Recurrence days: must match recurrence type requirements
- Next trigger time must be in future (or current minute for validation)

**State Transitions**:
- Created: enabled=true, next_trigger_time calculated
- Updated: next_trigger_time recalculated
- Triggered: last_triggered updated, next_trigger_time recalculated
- Disabled: enabled=false (preserves data for re-enabling)
- Deleted: cascade delete from memos

**Calculation Logic** (PostgreSQL function):
```sql
CREATE OR REPLACE FUNCTION calculate_next_trigger_time(
    p_scheduled_time VARCHAR,
    p_recurrence_type VARCHAR,
    p_recurrence_days TEXT,
    p_user_timezone VARCHAR
) RETURNS TIMESTAMP AS $$
DECLARE
    v_next_time TIMESTAMP;
    v_user_tz TEXT;
BEGIN
    -- Implementation in application layer (Python with zoneinfo)
    -- Returns UTC timestamp
    RETURN v_next_time AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;
```

---

### 4. AlarmHistory

**Purpose**: Track audit trail of when alarms triggered and delivery status

**Fields**:
```sql
CREATE TABLE alarm_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alarm_id UUID NOT NULL REFERENCES alarms(id) ON DELETE CASCADE,

    triggered_at TIMESTAMP NOT NULL,             -- When alarm fired (should be ~next_trigger_time)
    delivery_status VARCHAR(20) NOT NULL,        -- 'sent', 'failed', 'pending'
    error_message TEXT,                          -- If failed: reason (timeout, rate limit, network, etc)
    retry_count INT DEFAULT 0,                   -- How many times retried

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_alarm_history_alarm_id (alarm_id, triggered_at DESC),
    INDEX idx_alarm_history_status (delivery_status, created_at DESC)
);
```

**Constraints**:
- `alarm_id`: Foreign key to `alarms`, cascade delete
- `triggered_at`: Timestamp when alarm was due
- `delivery_status`: Enum (sent, failed, pending)
- `error_message`: Optional, only populated if failed
- `retry_count`: 0 on first attempt, incremented on retries

**Read Operations**:
- User views memo → dashboard queries recent history (last 10 records)
- Alarm check job queries to prevent duplicates
- Analytics: count by status, average delivery time

**Retention Policy**:
- Keep indefinitely (or archive after 1 year if storage concern)
- User can view full history in dashboard

---

### 5. DeliveryQueue (Optional, for advanced retry handling)

**Purpose**: Persist failed messages for retry without losing data

**Fields**:
```sql
CREATE TABLE delivery_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alarm_id UUID NOT NULL REFERENCES alarms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),

    message_content TEXT NOT NULL,               -- Telegram message to send
    next_retry_time TIMESTAMP NOT NULL,
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    last_error TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_queue_next_retry (next_retry_time),
    INDEX idx_queue_user_id (user_id, created_at DESC)
);
```

**Lifecycle**:
1. Alarm triggered → message created in queue with next_retry_time = now
2. Send attempt fails → increment attempt_count, set next_retry_time to exponential backoff time
3. Scheduler checks queue every minute for due items
4. After max_attempts: move to AlarmHistory with status='failed', delete from queue

---

### 6. TelegramLinkingCode (Optional, for auth flow)

**Purpose**: One-time codes for linking Telegram to dashboard account

**Fields**:
```sql
CREATE TABLE telegram_linking_codes (
    code VARCHAR(32) PRIMARY KEY,                -- Random alphanumeric string
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,               -- Expires in 10 minutes
    used BOOLEAN DEFAULT FALSE,

    INDEX idx_linking_code_user_id (user_id)
);
```

**Lifecycle**:
1. User clicks "Link Telegram" → backend generates code, expires in 10 minutes
2. Code displayed to user: "Send `/link {code}` to our Telegram bot"
3. User sends to bot → bot verifies code exists, not used, not expired
4. Bot marks used=true, sets user.telegram_chat_id
5. Cleanup job: delete expired codes daily

---

## Validation Rules & Constraints Summary

| Entity | Field | Type | Validation | Required |
|--------|-------|------|-----------|----------|
| User | email | VARCHAR(255) | Valid email, unique | Yes |
| User | password_hash | VARCHAR(255) | Non-empty hash | Yes |
| User | telegram_chat_id | BIGINT | Valid integer | No* |
| User | timezone | VARCHAR(50) | Valid IANA timezone | Yes |
| Memo | title | VARCHAR(255) | Non-empty, ≤255 chars | Yes |
| Memo | description | TEXT | ≤2000 chars | No |
| Alarm | scheduled_time | VARCHAR(5) | HH:MM format | Yes |
| Alarm | recurrence_type | VARCHAR(20) | Enum value | Yes |
| Alarm | recurrence_days | TEXT (JSON) | Valid JSON array | Conditional |
| Alarm | user_timezone | VARCHAR(50) | Valid IANA timezone | Yes |
| Alarm | next_trigger_time | TIMESTAMP | Future time in UTC | Yes |
| Alarm | enabled | BOOLEAN | true/false | Yes |
| AlarmHistory | triggered_at | TIMESTAMP | Valid timestamp | Yes |
| AlarmHistory | delivery_status | VARCHAR(20) | Enum (sent/failed/pending) | Yes |
| AlarmHistory | error_message | TEXT | Any text | No |

*telegram_chat_id not required for account creation, but required for notifications

---

## Indexes for Performance

### Critical Indexes (must have)
```sql
-- For alarm checking (every minute)
CREATE INDEX idx_alarms_next_trigger ON alarms(next_trigger_time)
  WHERE enabled = TRUE;

-- For user's memos list
CREATE INDEX idx_memos_user_id ON memos(user_id);

-- For alarm history display
CREATE INDEX idx_alarm_history_alarm_id ON alarm_history(alarm_id, triggered_at DESC);

-- For delivery queue processing
CREATE INDEX idx_delivery_queue_next_retry ON delivery_queue(next_retry_time)
  WHERE attempt_count < max_attempts;
```

### Optional Indexes (nice to have)
```sql
-- For user profile/settings
CREATE INDEX idx_users_email ON users(email);

-- For analytics
CREATE INDEX idx_alarm_history_status ON alarm_history(delivery_status, created_at DESC);

-- For memo sorting
CREATE INDEX idx_memos_created_at ON memos(user_id, created_at DESC);
```

---

## Data Integrity & Cascading

### Delete Cascades
- **User deleted** → All memos, alarms, alarm_history deleted
- **Memo deleted** → All alarms, alarm_history deleted
- **Alarm deleted** → All alarm_history deleted (soft delete preferred: set enabled=false)

### Foreign Key Constraints
```sql
ALTER TABLE memos
ADD CONSTRAINT fk_memos_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE alarms
ADD CONSTRAINT fk_alarms_memo_id
FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE;

ALTER TABLE alarm_history
ADD CONSTRAINT fk_alarm_history_alarm_id
FOREIGN KEY (alarm_id) REFERENCES alarms(id) ON DELETE CASCADE;
```

---

## Migration Strategy

### Phase 1: Initial Schema
Create tables: User, Memo, Alarm, AlarmHistory

### Phase 2: Enhanced Features (Optional)
Add tables: DeliveryQueue, TelegramLinkingCode

### Backward Compatibility
- Never drop columns (deprecate instead)
- New fields: always have defaults or nullable
- Schema versioning: track migration order in `schema_versions` table

