# Telegram Memo Alert System

설정한 시간마다 텔레그램으로 알람을 보내주는 메모 관리 시스템입니다.

## 개요

- **프론트엔드**: React 대시보드 (GitHub Pages)
- **백엔드**: FastAPI + APScheduler (Render.com)
- **알림**: Telegram Bot API
- **데이터베이스**: PostgreSQL / SQLite

### 주요 기능

- ✅ 메모 생성/수정/삭제
- ✅ 일일/주간/월간/커스텀 반복 패턴 설정
- ✅ 사용자 시간대 기반 알람 스케줄링
- ✅ 텔레그램 알림 전송
- ✅ 알람 히스토리 및 전송 상태 조회

## 빠른 시작

### 필수 요구사항

- Python 3.9+
- Node.js 16+
- PostgreSQL 12+ (또는 SQLite)
- Telegram Bot Token

### 백엔드 설정

```bash
cd backend

# 가상환경 생성
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 환경 설정
cp .env.example .env
# .env 파일에서 TELEGRAM_BOT_TOKEN 설정

# 서버 실행
uvicorn src.main:app --reload
```

**API 문서**: http://localhost:8000/docs

### 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 설정
cp .env.example .env

# 개발 서버 실행
npm run dev
```

**대시보드**: http://localhost:5173

## 프로젝트 구조

```
.
├── backend/
│   ├── src/
│   │   ├── models/           # SQLAlchemy ORM 모델
│   │   ├── api/              # FastAPI 라우터
│   │   ├── services/         # 비즈니스 로직
│   │   ├── utils/            # 유틸리티 함수
│   │   └── main.py           # FastAPI 앱
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/       # React 컴포넌트
│   │   ├── pages/            # 페이지
│   │   ├── services/         # API 클라이언트
│   │   ├── hooks/            # 커스텀 훅
│   │   └── styles/           # CSS
│   └── tests/
└── docs/                     # 문서
```

## API 엔드포인트

### 인증
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `GET /api/v1/auth/me` - 프로필 조회

### 메모
- `GET /api/v1/memos` - 메모 목록
- `POST /api/v1/memos` - 메모 생성
- `GET /api/v1/memos/{id}` - 메모 상세
- `PATCH /api/v1/memos/{id}` - 메모 수정
- `DELETE /api/v1/memos/{id}` - 메모 삭제

### 알람
- `POST /api/v1/alarms` - 알람 생성
- `PATCH /api/v1/alarms/{id}` - 알람 수정
- `DELETE /api/v1/alarms/{id}` - 알람 삭제

### 히스토리
- `GET /api/v1/history/{alarm_id}` - 알람 히스토리

### 텔레그램
- `POST /api/v1/telegram/linking-code` - 연동 코드 생성
- `POST /api/v1/telegram/unlink` - 연동 해제

## 배포

### 백엔드 (Render.com)

1. GitHub에 코드 push
2. Render.com 대시보드에서 새 Web Service 생성
3. GitHub 리포지토리 연결
4. 빌드 명령어: `pip install -r requirements.txt`
5. 시작 명령어: `uvicorn src.main:app --host 0.0.0.0 --port 8000`
6. 환경 변수 설정: `.env` 파일의 값들 입력

### 프론트엔드 (GitHub Pages)

1. GitHub Actions 워크플로우 자동 배포
2. `frontend/.github/workflows/deploy.yml` 참조

## 문서

- [API 문서](docs/API.md)
- [아키텍처](docs/ARCHITECTURE.md)
- [배포 가이드](docs/DEPLOYMENT.md)
- [빠른 시작 가이드](specs/001-telegram-memo-alerts/quickstart.md)

## 개발 가이드

### 브랜치 관리

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

### 테스트 실행

```bash
# 백엔드
cd backend
pytest tests/

# 프론트엔드
cd frontend
npm test
```

## 라이선스

MIT

## 기여

이슈와 PR은 언제든 환영합니다!

