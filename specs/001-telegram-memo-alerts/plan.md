# Implementation Plan: Telegram Memo Alert System

**Branch**: `001-telegram-memo-alerts` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-telegram-memo-alerts/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a memo management system with scheduled Telegram notifications. Users create memos via a React dashboard hosted on GitHub Pages, configure flexible recurrence patterns (daily/weekly/monthly/custom), and receive notifications via Telegram Bot API. Backend runs on Render.com using FastAPI with APScheduler checking alarms every minute and sending Telegram messages. System tracks alarm history and supports per-user timezone detection for accurate scheduling.

## Technical Context

**Language/Version**: Python 3.9+ (Backend), JavaScript/TypeScript (Frontend)
**Primary Dependencies**: FastAPI (backend API), APScheduler (alarm scheduling), Telegram Bot API, React (frontend), SQLAlchemy (ORM)
**Storage**: PostgreSQL or SQLite (backend database for memos, alarms, users, history)
**Testing**: pytest (backend), Jest/Vitest (frontend)
**Target Platform**: Web application (Backend: Linux/Render.com, Frontend: GitHub Pages static hosting)
**Project Type**: Web application (separate frontend + backend)
**Performance Goals**:
- Alarm trigger accuracy: within 1 minute of scheduled time (99% uptime)
- Telegram delivery: within 30 seconds of alarm trigger (95% success rate)
- Dashboard load: under 2 seconds
- API response: under 500ms per operation
**Constraints**:
- APScheduler must check alarms every minute
- Frontend is static (GitHub Pages - no server-side rendering)
- Backend must handle timezone conversion for per-user local scheduling
- Graceful handling of Telegram API failures (retry/queue)
**Scale/Scope**:
- Support 10,000+ concurrent scheduled memos
- Each user can manage 100+ memos independently
- Multi-user system with user authentication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file not yet initialized for this project. Proceeding with standard best practices:
- ✅ Separation of concerns (frontend/backend)
- ✅ API contracts defined (REST endpoints)
- ✅ Data model with clear entities and relationships
- ✅ Error handling and graceful degradation for external service failures

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/              # SQLAlchemy ORM models (Memo, Alarm, User, AlarmHistory)
│   ├── api/                 # FastAPI routers and endpoints
│   ├── services/            # Business logic (alarm scheduling, notification sending)
│   ├── utils/               # Timezone handling, validation helpers
│   └── main.py              # FastAPI app initialization with APScheduler
└── tests/
    ├── unit/                # Unit tests for services
    ├── integration/         # Integration tests for API endpoints
    └── conftest.py          # pytest fixtures

frontend/
├── public/                  # Static assets for GitHub Pages
├── src/
│   ├── components/          # React components (MemoForm, MemoList, HistoryView, etc.)
│   ├── pages/               # Page-level components (Dashboard, Settings)
│   ├── services/            # API client, timezone detection
│   ├── hooks/               # Custom React hooks (useMemos, useAlarms, etc.)
│   ├── styles/              # CSS/styling
│   └── App.tsx              # Main app component
└── tests/
    ├── unit/                # Component unit tests
    └── integration/         # User flow tests

docs/
├── API.md                   # API documentation
├── DEPLOYMENT.md            # Deployment guide (GitHub Pages + Render.com)
└── ARCHITECTURE.md          # System architecture overview
```

**Structure Decision**: Web application with separate backend (Python/FastAPI on Render.com) and frontend (React on GitHub Pages). This enables:
- Independent scaling and deployment of frontend and backend
- Frontend as pure static site (no server-side dependencies)
- Backend focused on scheduling and Telegram integration
- Clear API contract between frontend and backend

## Complexity Tracking

No constitution violations. Standard web application architecture.

---

## Phase 0: Research & Clarifications

### Unknowns to Resolve

1. **User Authentication Strategy**: How users link dashboard to Telegram
2. **Database Choice**: PostgreSQL vs SQLite (performance/hosting considerations)
3. **Timezone Library**: Best practice for server-side timezone conversion
4. **Telegram Retry Logic**: Optimal retry strategy for failed messages
5. **Deployment Details**: GitHub Pages + Render.com integration specifics

### Research Tasks

Completed research (see research.md):
- ✅ User auth patterns for dashboard + Telegram integration
- ✅ Database choice for 10k+ concurrent scheduled memos
- ✅ Timezone handling library (pytz vs zoneinfo)
- ✅ Telegram Bot API rate limiting and retry strategies
- ✅ GitHub Pages + external API (CORS) configuration

---

## Phase 1: Design & API Contracts

### Generated Artifacts

✅ **Data Model** (`data-model.md`)
- User entity with Telegram linking
- Memo entity for storing tasks
- Alarm entity with flexible recurrence
- AlarmHistory for tracking delivery
- DeliveryQueue for retry logic
- TelegramLinkingCode for secure linking
- Database indexes optimized for alarm checking

✅ **API Contracts** (`contracts/api.openapi.yaml`)
- OpenAPI 3.0 specification
- 8 endpoints for authentication (register, login, profile, timezone)
- 5 endpoints for memo CRUD (create, list, get, update, delete)
- 3 endpoints for alarm management (create, update, delete)
- 1 endpoint for alarm history viewing
- 3 endpoints for Telegram integration (linking code, unlink, webhook)
- JWT Bearer token authentication
- Proper error handling with error codes

✅ **Quick Start Guide** (`quickstart.md`)
- Local development environment setup
- Backend (FastAPI + APScheduler) installation
- Frontend (React) installation
- Environment configuration
- Sample API calls and responses
- Telegram integration testing
- Debugging tips
- Deployment checklist
- Testing verification list

### Design Decisions Implemented

| Area | Decision | Rationale |
|------|----------|-----------|
| Database | PostgreSQL (SQLite for dev) | Scalable to 10k+ memos, Render.com native |
| Authentication | OAuth2 + JWT + Telegram linking | Secure, flexible, user-friendly |
| Timezone | Python zoneinfo + browser detection | Standard lib, accurate DST handling |
| Scheduling | APScheduler with DB job store | Persistent, handles restarts, simple |
| Retries | Exponential backoff (3 retries) + queue | Balances reliability vs API limits |
| Frontend State | React Context API + custom hooks | Lightweight, maintainable |
| API Pattern | REST with JWT auth + CORS | Standard web architecture |
| Pattern Storage | Simple fields + calculation | Flexible for all recurrence types |

### Validation & Constraints

- User timezone must be valid IANA format
- Scheduled time must be valid HH:MM (00:00-23:59)
- Recurrence days must match recurrence type
- Email must be unique and valid format
- Telegram Chat ID must be valid integer
- Next trigger time always stored in UTC
- Memo title required, description optional
- Cascade deletes for data integrity

### Re-evaluated Constitution Check

✅ All standard practices followed:
- Clean API contract definition
- Clear data model with relationships
- Separation of concerns (frontend/backend)
- Error handling with proper status codes
- JWT authentication for security
- CORS configured for frontend/backend integration
- Database indexes for performance
- Timezone and timezone handling documented

---

## Summary: Planning Complete

**Phase 0 Research**: ✅ Complete
- All unknowns researched and resolved
- Technology choices justified
- Best practices documented

**Phase 1 Design**: ✅ Complete
- Data model designed with validation rules
- API contracts defined (OpenAPI 3.0)
- Database schema with indexes
- Quick start guide for developers

**Ready for**: Phase 2 Task Generation (`/speckit.tasks`)
- Will generate implementation tasks in `tasks.md`
- Tasks organized by priority and dependencies
- Estimated effort per task
- Testing acceptance criteria
