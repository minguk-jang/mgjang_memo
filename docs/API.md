# API Documentation

## Base URL
- Development: `http://localhost:8000`
- Production: `https://your-api-domain.com`

## Authentication
All endpoints except `/auth/*` require JWT token in Authorization header:
```
Authorization: Bearer {access_token}
```

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Memos
- `POST /api/v1/memos` - Create memo
- `GET /api/v1/memos` - List memos
- `GET /api/v1/memos/{id}` - Get memo detail
- `PATCH /api/v1/memos/{id}` - Update memo
- `DELETE /api/v1/memos/{id}` - Delete memo

### Alarms
- `POST /api/v1/alarms` - Create alarm
- `PATCH /api/v1/alarms/{id}` - Update alarm
- `DELETE /api/v1/alarms/{id}` - Delete alarm

### History
- `GET /api/v1/history/{alarm_id}` - Get alarm history

### Telegram
- `POST /api/v1/telegram/linking-code` - Generate linking code
- `POST /api/v1/telegram/unlink` - Unlink Telegram account

See OpenAPI docs at `/docs` endpoint for full schema.
