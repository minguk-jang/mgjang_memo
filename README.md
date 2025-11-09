# Telegram Memo Alert System

A web application for creating memos and scheduling flexible recurring alarms that deliver notifications via Telegram.

## Overview

**Telegram Memo Alert System** is a full-stack application that enables users to:
- Create and manage memos with titles and descriptions
- Schedule alarms with flexible recurrence patterns (daily, weekly, monthly, custom)
- Receive Telegram notifications at scheduled times
- View alarm history and delivery status
- Manage account settings and timezone preferences

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Scheduling**: APScheduler
- **Authentication**: GitHub OAuth + JWT
- **ORM**: SQLAlchemy
- **Deployment**: Render.com

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Hosting**: GitHub Pages (static)
- **Build Tool**: Vite

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (or SQLite for development)
- Telegram Bot Token (from BotFather)

### Backend Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database and Telegram bot token
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start server:
```bash
uvicorn src.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Update VITE_API_BASE_URL to match your backend (include /api/v1)
```

3. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## GitHub OAuth Setup

1. Create a GitHub OAuth App (GitHub Settings → Developer settings → OAuth Apps) and set the **Homepage URL** to your frontend origin (e.g., `http://localhost:5173` locally).
2. Set the **Authorization callback URL** to the same origin (or a dedicated `/auth/callback` route if you add one later). This value must match `VITE_GITHUB_REDIRECT_URI`.
3. Copy the **Client ID** and **Client Secret** into the backend environment:
   ```
   # backend/.env
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```
4. Update the frontend environment so it can initiate the OAuth flow:
   ```
   # frontend/.env.local
   VITE_GITHUB_CLIENT_ID=your-client-id
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173
   VITE_GITHUB_OAUTH_SCOPE=read:user user:email
   ```
5. Restart both backend and frontend servers so the new configuration is picked up.

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── api/             # FastAPI routers and endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities (timezone, validation, etc.)
│   │   ├── middleware/      # Authentication, logging
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   └── main.py          # FastAPI app entry point
│   ├── tests/               # Unit and integration tests
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context
│   │   ├── utils/           # Utilities
│   │   └── App.tsx          # Main app component
│   ├── tests/               # Component tests
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
│
├── docs/
│   ├── ARCHITECTURE.md      # System architecture
│   ├── API.md              # API documentation
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── TROUBLESHOOTING.md  # Common issues
│
└── specs/
    └── 001-telegram-memo-alerts/
        ├── spec.md          # Feature specification
        ├── plan.md          # Implementation plan
        ├── tasks.md         # Task breakdown
        ├── data-model.md    # Data model
        └── contracts/       # API contracts
```

## Features

### Phase 1: Daily Reminders (MVP)
- ✅ GitHub-based authentication
- ✅ Create memos with daily alarm scheduling
- ✅ Dashboard displaying memos and next alarm times
- ✅ Telegram notifications for scheduled alarms
- ✅ Alarm history tracking

### Phase 2: Memo Management
- Edit and delete memos
- Update alarm schedules
- Cascade delete with alarm cleanup

### Phase 3: Advanced Scheduling
- Weekly patterns (select specific days)
- Monthly patterns (select days)
- Custom recurrence patterns
- Time picker for scheduling

### Phase 4: History & Monitoring
- View alarm trigger history
- Delivery status tracking (sent/failed/pending)
- Error messages for failed deliveries

### Phase 5+: Production Features
- Telegram account linking and unlinking
- Timezone management
- Deployment automation
- Performance optimization

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and component overview
- [API Documentation](./docs/API.md) - RESTful API endpoints and schemas
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
pytest tests/unit/ -v  # Unit tests only
pytest tests/integration/ -v  # Integration tests only
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment (Render.com)
See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions

### Frontend Deployment (GitHub Pages)
See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions

## Contributing

1. Create a feature branch
2. Implement changes following the project structure
3. Write tests for new functionality
4. Submit a pull request

## License

This project is part of the Learning by Building initiative.

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Review [spec.md](./specs/001-telegram-memo-alerts/spec.md) for requirements
- Check API documentation at `/docs` endpoint when backend is running
