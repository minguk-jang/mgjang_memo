# 알람 시스템 개선 - 완료 보고서

## 📋 변경 파일 목록

### Frontend

#### 신규 컴포넌트
- `frontend/src/components/AlarmSettings.tsx` - 알람 설정 UI (라디오 옵션)
- `frontend/src/components/UpcomingAlarms.tsx` - 다가오는 알람 3개 요약 보드

#### 수정 컴포넌트
- `frontend/src/components/Header.tsx` - 테마 토글을 오른쪽 상단으로 이동
- `frontend/src/components/MemoForm.tsx` - AlarmSettings 통합
- `frontend/src/components/MemoList.tsx` - 알람 활성화/비활성화 토글 추가
- `frontend/src/pages/Dashboard.tsx` - UpcomingAlarms 보드 추가

### Backend

#### 수정 파일
- `backend/src/models/alarm.py` - 새로운 알람 타입/채널 구조
- `backend/src/schemas/__init__.py` - Pydantic 스키마 업데이트

---

## 🎯 핵심 개선사항

### 1️⃣ 알람 설정 구조 개선

**이전**: 매일 같은 시각만 가능
**개선**: 3가지 옵션 제공

```
( ) 알림 안 함
( ) 지정 시간에 한 번 보내기 → [날짜·시간 선택]
( ) 반복적으로 보내기 → [매일/매주/매월] + [시간]

송신 방식: [✓] Telegram [ ] Email (준비중)
```

#### DB 구조
```python
class AlarmType(enum.Enum):
    NONE = "none"       # 알림 안 함
    ONCE = "once"       # 한 번만
    REPEAT = "repeat"   # 반복

class RepeatInterval(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class NotificationChannel(enum.Enum):
    NONE = "none"
    TELEGRAM = "telegram"
    EMAIL = "email"     # 준비중
```

#### 주요 필드
- `alarm_type`: none/once/repeat
- `alarm_time`: 'once' 타입일 때 특정 datetime
- `repeat_interval`: 'repeat' 타입일 때 주기
- `scheduled_time`: 반복 알람의 시간 (HH:MM)
- `channel`: telegram/email/none
- `user_timezone`: 기본값 "Asia/Seoul" (KST)

### 2️⃣ 테마 토글 위치 변경

**이전**: 헤더 중앙
**개선**: 오른쪽 상단 (이메일 | ☀️/🌙 | Logout)

```
[📋 Telegram Memo Alert System]     [user@email.com | ☀️ | Logout]
```

- 개인 설정 성격이라 프로필 근처에 배치
- 브랜드 타이틀 시선 분산 방지
- 구분선(divider)으로 시각적 구분

### 3️⃣ 알람 전송 UX 개선

#### MemoList 개선사항
- ✅ 알람 활성화/비활성화 토글 버튼 (💬/🔕)
- ✅ 비활성화된 메모는 opacity 0.6으로 흐림 처리
- ✅ "알람이 비활성화되었습니다" 상태 표시
- ✅ 채널별 아이콘 표시 (💬 Telegram, 📧 Email)

#### API 연동
```typescript
// 알람 토글
PATCH /api/v1/alarms/{alarm_id}
{
  "enabled": false
}
```

### 4️⃣ 알람 스케줄 요약 보드

**위치**: 대시보드 상단 (메모 폼 위)
**내용**: 다가오는 알람 3개 표시

```
⏰ 다음 알림
1. 💬 출근 준비 메모       2024-11-10 09:00  •  2시간 30분 후
2. 💬 결산 리포트 작성     2024-11-15 22:00  •  5일 후
3. 💬 주간 회의 준비       2024-11-17 10:00  •  7일 후

+12개 더 있음
```

#### 기능
- ✅ 현재 시간 기준 미래 알람만 표시
- ✅ 시간순 정렬
- ✅ "N일 후", "N시간 N분 후" 표시
- ✅ 채널 아이콘 표시
- ✅ 4개 이상일 때 "+N개 더 있음" 표시
- ✅ 알람 없으면 자동 숨김

---

## 🔧 기술적 구현 포인트

### Frontend

#### AlarmSettings 컴포넌트
```typescript
export interface AlarmConfig {
  alarmType: 'none' | 'once' | 'repeat';
  alarmDateTime?: string;      // ISO datetime for 'once'
  repeatInterval?: 'daily' | 'weekly' | 'monthly';
  scheduledTime?: string;       // HH:MM for 'repeat'
  channel: 'telegram' | 'email' | 'none';
}
```

#### MemoForm API 호출
```typescript
// 'once' 타입
{
  memo_id: 123,
  alarm_type: 'once',
  alarm_time: '2024-11-15T22:00:00Z',
  channel: 'telegram',
  user_timezone: 'Asia/Seoul'
}

// 'repeat' 타입
{
  memo_id: 123,
  alarm_type: 'repeat',
  repeat_interval: 'daily',
  scheduled_time: '09:00',
  channel: 'telegram',
  user_timezone: 'Asia/Seoul'
}
```

### Backend

#### 타임존 처리
- 모든 알람은 `Asia/Seoul` 기준
- `pytz.timezone('Asia/Seoul')` 사용
- DB에는 UTC로 저장, 표시는 KST

#### 마이그레이션 필요
```bash
# Alembic 마이그레이션 생성 (수동 실행 필요)
cd backend
alembic revision --autogenerate -m "Add flexible alarm scheduling"
alembic upgrade head
```

새로 추가된 컬럼:
- `alarm_type` (ENUM)
- `alarm_time` (TIMESTAMP WITH TIME ZONE)
- `repeat_interval` (ENUM)
- `channel` (ENUM)

기존 컬럼 유지 (호환성):
- `scheduled_time`, `recurrence_type`, `next_trigger_time` 등

---

## ✅ 구현 완료 체크리스트

### Frontend
- [x] AlarmSettings 컴포넌트 (라디오 옵션 3가지)
- [x] MemoForm에 AlarmSettings 통합
- [x] UpcomingAlarms 요약 보드
- [x] MemoList에 알람 토글 버튼
- [x] 비활성화된 메모 흐림 처리
- [x] Header 테마 토글 오른쪽 이동
- [x] 채널별 아이콘 표시 (💬📧🔕)
- [x] "N일 후" 시간 계산 표시

### Backend
- [x] Alarm 모델 업데이트 (AlarmType, RepeatInterval, Channel)
- [x] Pydantic 스키마 업데이트 (AlarmCreate, AlarmUpdate, AlarmResponse)
- [x] 기본 타임존 "Asia/Seoul" 설정
- [x] 기존 필드 호환성 유지

### 남은 작업
- [ ] Alembic 마이그레이션 실행
- [ ] AlarmService 로직 업데이트 (once 타입 처리)
- [ ] 스케줄러 로직 업데이트 (주간/월간 반복)
- [ ] 이메일 채널 구현 (현재 준비중)

---

## 🚀 실행 방법

### 1. Frontend 실행
```bash
cd frontend
npm run dev
```

### 2. Backend 마이그레이션 (필수)
```bash
cd backend
alembic revision --autogenerate -m "Add flexible alarm scheduling"
alembic upgrade head
```

### 3. Backend 실행
```bash
cd backend
python -m uvicorn src.main:app --reload
```

---

## 💡 향후 확장 가능성

### 즉시 추가 가능
1. ✅ 주간 반복 - 특정 요일 선택 (월, 수, 금)
2. ✅ 월간 반복 - 매월 N일
3. ✅ 커스텀 간격 - "3일마다", "2주마다"

### 중기 확장
1. 이메일 채널 완전 구현
2. 슬랙(Slack) 채널 추가
3. 푸시 알림(FCM) 추가
4. 카카오톡 알림톡

### 추가 기능 제안 (선택)
1. 메모 태그 기능 (#업무 #가족)
2. 검색창 (제목/내용 검색)
3. 보관(Archive) 기능
4. 알림 로그 페이지 (전송 이력)

---

## 📸 UI 스크린샷 설명

### 1. AlarmSettings
- 라디오 버튼 3개 (알림 안 함 / 한 번 / 반복)
- 한 번 선택 시: datetime-local 입력
- 반복 선택 시: 주기(매일/매주/매월) + 시간
- 송신 방식: Telegram 체크박스 (Email 준비중)

### 2. UpcomingAlarms
- 그라데이션 배경 (primary color)
- 3개씩 카드 형태로 표시
- 채널 아이콘 + 제목 + 시간 + "N일 후"
- 번호 표시 (1, 2, 3)

### 3. MemoList
- 각 메모 카드 우측: 알람 토글 버튼 + Delete
- 알람 비활성화 시: 카드 흐림 + "비활성화" 메시지
- 활성화 시: "Next alarm" 시간 표시

---

## 🎨 디자인 가이드

### 색상
- 알람 활성: var(--primary) (blue)
- 알람 비활성: var(--muted) (gray)
- 삭제 버튼: #EF4444 (red)
- 성공 토스트: #10B981 (green)

### 아이콘
- 💬 Telegram
- 📧 Email
- 🔕 알람 꺼짐
- 🔔 기본 알람
- ⏰ 다가오는 알람

### 간격/라운드
- 카드: rounded-2xl, p-6
- 버튼: rounded-xl, px-4 py-2
- gap: 6 (1.5rem)

---

## 🔒 보안 & 검증

- ✅ 사용자 본인 메모만 접근 가능 (JWT 인증)
- ✅ alarm_id로 알람 토글 시 소유권 검증
- ✅ Pydantic으로 입력 검증
- ✅ XSS 방지 (React 기본 이스케이프)
- ✅ CSRF 토큰 (FastAPI CORS)

---

## 📞 문의 & 피드백

구현 중 문제 발생 시:
1. Backend 로그 확인: `backend/logs/`
2. Frontend 콘솔 확인: 브라우저 개발자 도구
3. API 응답 확인: Network 탭

성공적인 리팩터링! 🎉
