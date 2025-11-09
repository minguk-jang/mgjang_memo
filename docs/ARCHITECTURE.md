# System Architecture

## Overview

The Telegram Memo Alert System is a full-stack web application with:
- **Backend**: FastAPI + SQLAlchemy + APScheduler
- **Frontend**: React + TypeScript + Zustand
- **Database**: PostgreSQL (production) / SQLite (development)
- **Notifications**: Telegram Bot API

## Component Architecture

### Backend Components
- **API Layer**: FastAPI routers for auth, memos, alarms, history, telegram
- **Service Layer**: Business logic for memo, alarm, scheduler, telegram operations
- **Database Layer**: SQLAlchemy ORM models with relationships
- **Utilities**: Timezone conversion, recurrence calculations, security

### Frontend Components
- **Pages**: Login, Register, Dashboard, Settings
- **Components**: MemoForm, MemoList, MemoDetail, RecurrenceSelector, TelegramSettings
- **Services**: API client, Telegram linking
- **Hooks**: useAuth, useMemos, useAlarmHistory, useModal

## Data Flow

1. **User Registration**: Frontend → Auth API → Database
2. **Create Memo**: Frontend → Memo API → Create Memo + Alarm
3. **Schedule Check**: APScheduler (every minute) → Check due alarms
4. **Notification**: Due Alarm → Telegram API → User's Telegram
5. **History**: AlarmHistory recorded for each trigger

## Deployment

- **Backend**: Render.com with PostgreSQL
- **Frontend**: GitHub Pages (static hosting)
- **Communication**: REST API with JWT authentication
