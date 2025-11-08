# Tasks: Telegram Memo Alert System

**Input**: Design documents from `/specs/001-telegram-memo-alerts/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Test tasks are OPTIONAL - only included where critical for feature validation
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4)
- **Paths**: `backend/src/`, `frontend/src/` per plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic directory structure

**Duration**: ~2-3 hours

- [ ] T001 Create backend directory structure: `backend/src/{models,api,services,utils}`, `backend/tests/{unit,integration}`
- [ ] T002 Create frontend directory structure: `frontend/src/{components,pages,services,hooks,styles}`, `frontend/tests/{unit,integration}`
- [ ] T003 [P] Create backend `requirements.txt` with dependencies: FastAPI, uvicorn, SQLAlchemy, psycopg2-binary, python-telegram-bot, APScheduler, python-jose, passlib, pydantic, pydantic-settings
- [ ] T004 [P] Create frontend `package.json` with dependencies: React, react-router-dom, axios, date-fns, zustand or jotai, TypeScript
- [ ] T005 [P] Initialize git ignoring patterns: `.env` files, `__pycache__`, `node_modules`, `.pytest_cache`, etc.
- [ ] T006 Create `.env.example` files for backend and frontend with placeholder values
- [ ] T007 [P] Setup project README in root: `README.md` with overview, setup instructions, deployment links

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure MUST complete before ANY user story begins

**⚠️ CRITICAL**: No user story work can begin until Phase 2 completes

**Duration**: ~8-10 hours

### Database & Models Foundation

- [ ] T008 [P] Create database connection module: `backend/src/database.py` with SQLAlchemy engine, sessionmaker, Base class
- [ ] T009 [P] Create alembic migrations folder structure for database version control
- [ ] T010 Create User base model in `backend/src/models/user.py` with fields: id, email, password_hash, telegram_chat_id, timezone, created_at, updated_at
- [ ] T011 [P] Create Memo base model in `backend/src/models/memo.py` with fields: id, user_id, title, description, created_at, updated_at
- [ ] T012 [P] Create Alarm base model in `backend/src/models/alarm.py` with fields: id, memo_id, scheduled_time, recurrence_type, recurrence_days, next_trigger_time, last_triggered, enabled, user_timezone, created_at, updated_at
- [ ] T013 [P] Create AlarmHistory base model in `backend/src/models/alarm_history.py` with fields: id, alarm_id, triggered_at, delivery_status, error_message, retry_count, created_at
- [ ] T014 [P] Create TelegramLinkingCode model in `backend/src/models/telegram_linking_code.py` with fields: code, user_id, created_at, expires_at, used
- [ ] T015 [P] Add database indexes to models: `next_trigger_time` on Alarm, `user_id` on Memo, `alarm_id` on AlarmHistory

### Authentication & Security

- [ ] T016 Create JWT/Token utilities in `backend/src/utils/security.py`: hash_password(), verify_password(), create_access_token(), verify_token()
- [ ] T017 Create authentication middleware in `backend/src/middleware/auth.py` for JWT bearer token validation
- [ ] T018 [P] Create timezone utility module in `backend/src/utils/timezone.py`: validate_timezone(), convert_to_user_tz(), convert_to_utc()
- [ ] T019 [P] Create recurrence pattern validator in `backend/src/utils/recurrence.py`: validate_recurrence_pattern(), calculate_next_trigger_time()

### API & Framework Setup

- [ ] T020 Create FastAPI application initialization in `backend/src/main.py`: app instance, CORS middleware, error handlers
- [ ] T021 [P] Create Pydantic schemas for request/response validation in `backend/src/schemas/__init__.py`: UserCreate, MemoCreate, AlarmCreate, etc. (base schemas)
- [ ] T022 Configure logging in `backend/src/utils/logging.py` with rotating file handlers and structured logging
- [ ] T023 [P] Setup APScheduler in `backend/src/scheduler.py`: BackgroundScheduler initialization, database job store configuration

### Frontend Setup

- [ ] T024 [P] Create React app entry point in `frontend/src/index.tsx` with root component mounting
- [ ] T025 [P] Create TypeScript config in `frontend/tsconfig.json` with strict mode enabled
- [ ] T026 [P] Create API client service in `frontend/src/services/api.ts`: axios instance, base URL configuration, interceptors for JWT
- [ ] T027 [P] Create context for authentication state in `frontend/src/context/AuthContext.tsx`: login, logout, token management
- [ ] T028 [P] Create timezone detection utility in `frontend/src/utils/timezone.ts`: detect user timezone from browser

### Environment & Configuration

- [ ] T029 [P] Create backend environment config in `backend/src/config.py`: load from .env using pydantic-settings
- [ ] T030 [P] Create frontend environment config in `frontend/.env` file handling and runtime configuration

**Checkpoint**: Foundation ready - all user story phases can now proceed in parallel or sequentially

---

## Phase 3: User Story 1 - Create and Schedule Daily Reminders (Priority: P1) 🎯 MVP

**Goal**: Users can create memos, set daily alarms, and receive Telegram notifications at scheduled times

**Independent Test**: Create memo with daily 9:00 AM alarm → verify dashboard displays memo with next alarm time → wait for scheduled time → confirm Telegram notification received → verify AlarmHistory shows status "sent"

**Duration**: ~6-8 hours

### Models for User Story 1

- [ ] T031 [P] [US1] Add daily recurrence logic to Alarm model: validate scheduled_time format (HH:MM), ensure daily type has empty recurrence_days
- [ ] T032 [P] [US1] Add to_dict() serialization method to Alarm model for API responses

### Services for User Story 1

- [ ] T033 [US1] Create MemoService in `backend/src/services/memo_service.py`: create_memo(user_id, title, description), get_memo(memo_id, user_id), list_memos(user_id) (depends on T010, T011)
- [ ] T034 [US1] Create AlarmService in `backend/src/services/alarm_service.py`: create_alarm(memo_id, scheduled_time, recurrence_type, user_timezone), calculate_next_trigger_time_daily(), update_alarm_after_trigger() (depends on T012, T013, T018, T019)
- [ ] T035 [US1] Create TelegramNotificationService in `backend/src/services/telegram_service.py`: send_telegram_message(chat_id, memo_title, memo_description), format_memo_message() (depends on T021)
- [ ] T036 [US1] Create AlarmSchedulerService in `backend/src/services/scheduler_service.py`: check_due_alarms(), process_alarm(alarm), retry_failed_deliveries() (depends on T013, T034, T035)

### API Endpoints for User Story 1

- [ ] T037 [P] [US1] Implement memo endpoints in `backend/src/api/memos.py`: POST /api/v1/memos (create), GET /api/v1/memos (list), GET /api/v1/memos/{id} (get detail) with JWT auth
- [ ] T038 [P] [US1] Implement alarm endpoints in `backend/src/api/alarms.py`: POST /api/v1/alarms (create daily alarm only) with JWT auth
- [ ] T039 [P] [US1] Implement authentication endpoints in `backend/src/api/auth.py`: POST /auth/register, POST /auth/login with JWT token response

### Scheduler Integration for User Story 1

- [ ] T040 [US1] Add alarm check job to APScheduler in `backend/src/main.py`: `check_alarms` job runs every minute, calls AlarmSchedulerService.check_due_alarms() (depends on T036)
- [ ] T041 [US1] Create AlarmHistory record on successful Telegram send in `backend/src/services/alarm_service.py`: triggered_at=now, delivery_status="sent"

### Frontend Components for User Story 1

- [ ] T042 [P] [US1] Create LoginPage component in `frontend/src/pages/LoginPage.tsx`: email/password form, error handling, redirect to dashboard on success
- [ ] T043 [P] [US1] Create RegisterPage component in `frontend/src/pages/RegisterPage.tsx`: email/password form with validation, redirect to login on success
- [ ] T044 [P] [US1] Create MemoForm component in `frontend/src/components/MemoForm.tsx`: title/description inputs, daily alarm time picker (HH:MM), submit button
- [ ] T045 [P] [US1] Create MemoList component in `frontend/src/components/MemoList.tsx`: displays memos with title, description, next alarm time in user's local timezone
- [ ] T046 [US1] Create Dashboard page in `frontend/src/pages/Dashboard.tsx`: imports MemoForm, MemoList, handles memo creation via API call (depends on T042, T044, T045)

### Frontend API Integration for User Story 1

- [ ] T047 [P] [US1] Create useMemos hook in `frontend/src/hooks/useMemos.ts`: fetch memos from API, refetch after creation, error handling
- [ ] T048 [P] [US1] Create useAuth hook in `frontend/src/hooks/useAuth.ts`: login/register/logout functions, JWT token management
- [ ] T049 [US1] Create API memo endpoints client in `frontend/src/services/memoAPI.ts`: POST /memos, GET /memos, GET /memos/{id} calls with JWT (depends on T047)

### Timezone Handling for User Story 1

- [ ] T050 [US1] Implement browser timezone detection on app load: store in AuthContext, send to backend on alarm creation
- [ ] T051 [US1] Display alarm times in user's local timezone on MemoList component: convert API UTC times to user timezone for display

**Checkpoint: User Story 1 Complete**
- Users can register/login
- Create memo with daily alarm
- See memo in dashboard with correct next alarm time
- Receive Telegram notification at scheduled time (if Telegram linked)
- Alarm history shows "sent" status

---

## Phase 4: User Story 2 - Manage Memo Lifecycle (Priority: P1)

**Goal**: Users can fully manage memos: view, edit, and delete with automatic alarm updates

**Independent Test**: Create memo → edit title/time → verify changes save → view memo details → delete memo → verify no longer in list and no future alarms

**Duration**: ~5-6 hours

### Models for User Story 2

- [ ] T052 [P] [US2] No new models (reuse from US1: Memo, Alarm)

### Services for User Story 2

- [ ] T053 [US2] Extend MemoService with: update_memo(memo_id, user_id, title, description), delete_memo(memo_id, user_id) - cascade deletes alarms (depends on T033, T010, T011)
- [ ] T054 [US2] Extend AlarmService with: delete_alarm(alarm_id), update_alarm(alarm_id, scheduled_time, recurrence_type, user_timezone) with recalculation of next_trigger_time (depends on T034)

### API Endpoints for User Story 2

- [ ] T055 [P] [US2] Extend memo endpoints in `backend/src/api/memos.py`: PATCH /api/v1/memos/{id} (update), DELETE /api/v1/memos/{id} (delete with cascade)
- [ ] T056 [P] [US2] Extend alarm endpoints in `backend/src/api/alarms.py`: PATCH /api/v1/alarms/{id} (update), DELETE /api/v1/alarms/{id}

### Frontend Components for User Story 2

- [ ] T057 [P] [US2] Create EditMemoForm component in `frontend/src/components/EditMemoForm.tsx`: populated with existing memo data, edit/save/cancel buttons
- [ ] T058 [P] [US2] Create MemoDetail component in `frontend/src/components/MemoDetail.tsx`: full memo display, edit button, delete button with confirmation
- [ ] T059 [US2] Extend Dashboard with edit/delete buttons on MemoList items, open EditMemoForm/MemoDetail modals (depends on T046, T057, T058)

### Frontend Hooks for User Story 2

- [ ] T060 [P] [US2] Extend useMemos hook with update/delete functions, refetch on mutation
- [ ] T061 [P] [US2] Create useModal hook in `frontend/src/hooks/useModal.ts` for modal state management

**Checkpoint: User Story 2 Complete**
- Full CRUD for memos works
- Edit updates title, description, and alarm times
- Delete removes memo and cascades to alarms
- UI shows all changes immediately

---

## Phase 5: User Story 3 - Configure Flexible Recurrence Patterns (Priority: P2)

**Goal**: Users can schedule alarms for weekly, monthly, and custom patterns beyond daily

**Independent Test**: Create memo with weekly Mon/Wed/Fri alarm → verify next trigger calculates correctly → create monthly alarm → create custom 3-day pattern → all calculate next times correctly

**Duration**: ~7-8 hours

### Models for User Story 3

- [ ] T062 [P] [US3] Extend Alarm model validation: weekly requires recurrence_days as array of 0-6, monthly as 1-31, custom as 0-6 selection

### Services for User Story 3

- [ ] T063 [US3] Extend AlarmService with weekly/monthly/custom logic: calculate_next_trigger_time_weekly(), calculate_next_trigger_time_monthly(), calculate_next_trigger_time_custom() (depends on T034, T019)
- [ ] T064 [US3] Refactor calculate_next_trigger_time() to dispatch to correct function based on recurrence_type

### Utilities for User Story 3

- [ ] T065 [US3] Extend `backend/src/utils/recurrence.py` with: validate_recurrence_days(), next_weekday(current_date, target_days), next_month_day(current_date, target_day)

### API Endpoints for User Story 3

- [ ] T066 [US3] Extend POST /api/v1/alarms to accept: weekly + recurrence_days, monthly + recurrence_days, custom + recurrence_days (update validation in T021)

### Frontend Components for User Story 3

- [ ] T067 [P] [US3] Create RecurrenceSelector component in `frontend/src/components/RecurrenceSelector.tsx`: radio buttons for type (daily, weekly, monthly, custom)
- [ ] T068 [P] [US3] Create WeeklySelector in `frontend/src/components/WeeklySelector.tsx`: 7 day checkboxes (Sun-Sat)
- [ ] T069 [P] [US3] Create MonthlySelector in `frontend/src/components/MonthlySelector.tsx`: 28/29/30/31 day picker
- [ ] T070 [P] [US3] Create CustomSelector in `frontend/src/components/CustomSelector.tsx`: day checkboxes matching visual selector requirement
- [ ] T071 [US3] Extend MemoForm to conditionally show recurrence selector based on type: calls T067, T068, T069, T070 (depends on T044, T067-T070)

### Frontend API Integration for User Story 3

- [ ] T072 [P] [US3] Update memoAPI.ts POST /alarms to send recurrence_type + recurrence_days

**Checkpoint: User Story 3 Complete**
- Weekly patterns with day selection work
- Monthly patterns work
- Custom patterns with visual selector work
- All correctly calculate next trigger times

---

## Phase 6: User Story 4 - View Alert History and Status (Priority: P3)

**Goal**: Users can see when alarms triggered and delivery status (sent/failed/pending)

**Independent Test**: Trigger alarm → check history shows triggered_at and status "sent" → simulate failure → history shows "failed" with error message

**Duration**: ~4-5 hours

### Models for User Story 4

- [ ] T073 [P] [US4] AlarmHistory model already created in T013, no changes needed

### Services for User Story 4

- [ ] T074 [US4] Create AlarmHistoryService in `backend/src/services/alarm_history_service.py`: get_history(alarm_id, user_id, skip, limit), record_trigger(alarm_id, status, error_message)

### API Endpoints for User Story 4

- [ ] T075 [US4] Implement history endpoint in `backend/src/api/history.py`: GET /api/v1/history/{alarm_id} with pagination, JWT auth

### Frontend Components for User Story 4

- [ ] T076 [P] [US4] Create AlarmHistory component in `frontend/src/components/AlarmHistory.tsx`: table/list of triggers with timestamp, status badge (sent/failed/pending), error message if failed
- [ ] T077 [P] [US4] Create StatusBadge component in `frontend/src/components/StatusBadge.tsx`: visual indicator for delivery_status colors (green=sent, red=failed, yellow=pending)
- [ ] T078 [US4] Integrate AlarmHistory into MemoDetail component (depends on T058, T076)

### Frontend Hooks for User Story 4

- [ ] T079 [P] [US4] Create useAlarmHistory hook in `frontend/src/hooks/useAlarmHistory.ts`: fetch history for alarm with pagination

**Checkpoint: User Story 4 Complete**
- Users see alarm trigger history
- Delivery status displays correctly
- Error messages shown for failed deliveries

---

## Phase 7: Telegram Integration & Authentication

**Purpose**: Link Telegram accounts and send real notifications

**Duration**: ~6-7 hours

### Telegram Bot Setup

- [ ] T080 Create Telegram bot webhook handler in `backend/src/services/telegram_bot.py`: handle /start, /link {code}, /unlink messages
- [ ] T081 [P] Create TelegramBot application class in `backend/src/telegram_bot.py`: instantiate with TOKEN, setup handlers, polling mode for development
- [ ] T082 Implement linking flow: generate 10-min expiring code → store in TelegramLinkingCode → user sends /link code to bot → bot validates and links user

### API Endpoints for Telegram

- [ ] T083 [US1+] Implement POST /api/v1/telegram/linking-code: generate code, return code + expiration (depends on T037)
- [ ] T084 [US1+] Implement POST /api/v1/telegram/unlink: set telegram_chat_id to NULL (depends on T037)
- [ ] T085 [P] Implement POST /webhook/telegram: webhook handler for Telegram updates (polling alternative)

### Frontend Telegram Linking UI

- [ ] T086 [P] Create TelegramSettings component in `frontend/src/components/TelegramSettings.tsx`: button to generate linking code, display code, instructions to send to bot, unlink button
- [ ] T087 Create SettingsPage in `frontend/src/pages/SettingsPage.tsx`: import TelegramSettings, timezone selector
- [ ] T088 Add Settings link to Dashboard navigation (depends on T046, T087)

### Test Telegram Integration

- [ ] T089 [US1+] Test manual: Register user → generate linking code → send /link code to test bot → verify user.telegram_chat_id is set → trigger alarm → verify message received

---

## Phase 8: Deployment & Documentation

**Purpose**: Ready for production deployment

**Duration**: ~4-5 hours

### Backend Deployment

- [ ] T090 [P] Create `backend/Procfile` for Render.com deployment with start command
- [ ] T091 [P] Create `backend/.dockerignore` and optional `backend/Dockerfile` for containerization
- [ ] T092 Create `backend/alembic/versions/` with initial schema migration SQL (or generate from models)
- [ ] T093 Create deployment guide in `docs/DEPLOYMENT.md`: Render.com setup, environment variables, database provisioning

### Frontend Deployment

- [ ] T094 [P] Create `frontend/.github/workflows/deploy.yml` GitHub Actions workflow for GitHub Pages deployment
- [ ] T095 [P] Add `REACT_APP_API_BASE_URL` configuration for production backend URL

### Documentation

- [ ] T096 Create `docs/ARCHITECTURE.md`: system diagram, component overview, data flow
- [ ] T097 Create `docs/API.md`: export from contracts/api.openapi.yaml, add examples
- [ ] T098 [P] Update `README.md` with setup instructions, architecture overview, deployment links
- [ ] T099 Create `docs/TROUBLESHOOTING.md`: common issues and solutions from quickstart.md

### Quickstart Validation

- [ ] T100 [US1-US4] Run through entire `specs/001-telegram-memo-alerts/quickstart.md`: local setup, sample API calls, verify all working end-to-end

---

## Phase 9: Polish & Performance

**Purpose**: Refinements and optimizations across all features

**Duration**: ~5-6 hours

### Backend Improvements

- [ ] T101 [P] Add database query logging and slow query detection in `backend/src/utils/logging.py`
- [ ] T102 [P] Implement connection pooling optimization for PostgreSQL in `backend/src/database.py`
- [ ] T103 Add caching layer for user timezone lookups: `backend/src/utils/cache.py` with TTL cache
- [ ] T104 Improve error messages and validation: ensure all 400-series errors have helpful messages
- [ ] T105 [P] Add request/response logging middleware in `backend/src/middleware/`

### Frontend Improvements

- [ ] T106 [P] Add loading states to all buttons and forms
- [ ] T107 [P] Add error toast notifications for API failures in `frontend/src/utils/notifications.ts`
- [ ] T108 [P] Implement keyboard shortcuts for common actions (Esc to close modal, Ctrl+S to save)
- [ ] T109 Add accessibility features: ARIA labels, keyboard navigation, semantic HTML
- [ ] T110 [P] Add responsive design: mobile-friendly layout with media queries

### Testing

- [ ] T111 [P] Add unit tests for timezone conversion functions in `backend/tests/unit/test_timezone.py`
- [ ] T112 [P] Add unit tests for recurrence calculation in `backend/tests/unit/test_recurrence.py`
- [ ] T113 [P] Add integration test for full alarm creation → notification flow in `backend/tests/integration/test_alarm_notification.py`
- [ ] T114 [P] Add React component snapshot tests for key components in `frontend/tests/unit/`

### Monitoring & Logging

- [ ] T115 Add structured logging for alarm checks: log every check, every trigger, every notification attempt
- [ ] T116 Create monitoring dashboard view (optional): show recent alarms, delivery success rate, error trends
- [ ] T117 [P] Add metrics collection: alarm trigger count, Telegram delivery latency, database query time

---

## Dependencies & Execution Order

### Phase Dependencies (STRICT)

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 - Start after Phase 2 complete
- **Phase 4 (US2)**: Depends on Phase 2 + US1 (mostly independent, but uses US1 models)
- **Phase 5 (US3)**: Depends on Phase 2 + US1 - Uses Alarm model from US1
- **Phase 6 (US4)**: Depends on Phase 2 + US1 - Uses AlarmHistory model
- **Phase 7 (Telegram)**: Depends on Phase 2 + US1 - Integrates with notification flow
- **Phase 8 (Deployment)**: Depends on all phases except Phase 9
- **Phase 9 (Polish)**: Can start after Phase 8, or run in parallel with later feature phases

### User Story Execution

**Sequential (safe)**: US1 → US2 → US3 → US4
- Lower risk, easier to debug
- Time to market: slowest

**Parallel (after Foundational)**: Start US1, US2, US3 concurrently after Phase 2
- Higher efficiency if team available
- Risk of integration issues - test carefully at checkpoints

**Recommended MVP Path**:
1. Complete Phase 1 (Setup): ~3 hours
2. Complete Phase 2 (Foundational): ~10 hours - **BLOCKS everything**
3. Complete Phase 3 (US1): ~8 hours - **DEMO READY: MVP with daily alarms**
4. Optional: Phases 4-9 add features incrementally

### Parallel Opportunities Within Each Phase

**Phase 1 (Setup)**: All [P] tasks can run in parallel
- T003, T004, T005, T007 independent

**Phase 2 (Foundational)**: Organize by subsystem, parallelize within:
- Database: T008-T015 (T010 after T008, others parallel)
- Security: T016-T019 parallel after T008
- API: T020-T023 after T008
- Frontend: T024-T030 all parallel

**Phase 3 (US1)**:
- Models (T031-T032) parallel
- Services parallel: T033, T034, T035, T036 after models (some dependencies)
- API endpoints parallel: T037, T038, T039 after models/services
- Frontend components parallel: T042-T046
- Hooks parallel: T047-T049
- Timezone: T050, T051 after frontend

**Recommendation**: With single developer, follow sequential order. With team, parallelize within phase but enforce phase boundaries strictly.

---

## Parallel Example: Efficient US1 Execution

```
With 2-3 developers, after Phase 2 complete:

Developer A:
- T031-T032: Add daily logic to Alarm model
- T033-T035: Create MemoService, AlarmService, TelegramNotificationService
- T040: APScheduler integration

Developer B (parallel):
- T037-T039: API endpoints
- T050: Browser timezone detection
- T083: Telegram linking endpoint

Developer C (parallel):
- T042-T046: React components (MemoList, MemoForm)
- T047-T049: Hooks (useMemos, useAuth, API client)
- T051: Display timezone conversion

Sync points:
- After T032: API integration tests can be written
- After T036: Services ready for endpoint implementation
- After T049: Component integration with API ready

Result: Full US1 in ~8 hours (vs ~16 hours sequential)
```

---

## Implementation Strategy

### MVP First (Recommended)

**Goal: Functional demo in ~13-15 hours**

1. **Phase 1** (Setup): 3 hours
2. **Phase 2** (Foundational): 10 hours - **CRITICAL BLOCKER**
3. **Phase 3** (User Story 1): 8 hours

**STOP and VALIDATE**: Test end-to-end:
- Register user
- Create memo with daily 9:00 AM alarm
- See in dashboard
- At 9:00 AM: receive Telegram notification
- View alarm history with "sent" status

**Decision**: Deploy MVP or continue?

### Incremental Delivery (Full Feature)

**Build on MVP**: Add features in priority order

1. Phase 3 complete (US1) = MVP with daily alarms ✅
2. Add Phase 4 (US2) = Full CRUD memo management
3. Add Phase 5 (US3) = Weekly/monthly/custom patterns
4. Add Phase 6 (US4) = History viewing
5. Add Phase 7 (Telegram) = Real Telegram integration
6. Add Phase 8 (Deployment) = Production ready
7. Add Phase 9 (Polish) = Performance/UX refinements

**Timeline**: Each phase adds value independently
- After Phase 3: Basic daily reminders
- After Phase 4: Full memo management
- After Phase 5: Sophisticated scheduling
- After Phase 6: Visibility into reliability
- After Phase 7: Real notifications
- After Phase 8: Live deployment
- After Phase 9: Polished product

### Team Parallel Strategy

**With 3 developers + enforced Phase 2 blocker**:

1. **All together**: Complete Phase 1 (Setup) + Phase 2 (Foundational) - ~13 hours
2. **Split parallel**:
   - Developer A: Complete Phase 3 (US1) + Phase 4 (US2) = Memo CRUD + daily alarms
   - Developer B: Complete Phase 5 (US3) = Advanced recurrence
   - Developer C: Complete Phase 7 (Telegram Integration) while others work on features
3. **Merge** at Phase 8: All features integrated, final testing
4. **Parallel polish**: Phase 9 tasks can run in parallel

**Total**: ~30-35 hours for full feature (vs ~50 sequential)

---

## Task Validation

**Format Check**: ✅ All tasks follow `- [ ] [ID] [P?] [Story?] Description`

**Total Task Count**: 117 tasks
- Setup (Phase 1): 7 tasks
- Foundational (Phase 2): 23 tasks
- User Story 1 (US1): 19 tasks
- User Story 2 (US2): 10 tasks
- User Story 3 (US3): 16 tasks
- User Story 4 (US4): 9 tasks
- Telegram Integration: 9 tasks
- Deployment: 9 tasks
- Polish: 16 tasks

**Per User Story**:
- US1 (P1, MVP): 19 tasks → ~8 hours
- US2 (P1): 10 tasks → ~5 hours (depends on US1)
- US3 (P2): 16 tasks → ~7 hours
- US4 (P3): 9 tasks → ~4 hours

**Independence Check**: ✅
- US1 can complete independently (needs Phase 2)
- US2 reuses US1 models, but independently testable
- US3 extends US1 with new UI, independently testable
- US4 uses AlarmHistory from phase 2, independently testable

**Parallel Marked**: [P] markers identify parallelizable tasks (different files, no dependencies)

---

## Notes

- **Tests**: Contract/integration tests OPTIONAL in this project (feature-focused, not TDD mandated)
- **Dependencies**: Enforce Phase 2 completion before ANY user story work
- **Commits**: Suggest committing after each task or logical group (e.g., after all models done)
- **Checkpoints**: Stop and validate at each phase checkpoint before moving on
- **Blockers**: If Phase 2 incomplete, ALL user stories blocked - prioritize heavily
- **Communication**: With team, sync at phase boundaries to ensure dependencies satisfied

