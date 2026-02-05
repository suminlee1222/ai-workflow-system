# AI Workflow System

업무(Task)를 등록하면 AI가 판단을 보조하고, 그 결과를 구조화된 카드 형태로 제공하는 **업무 판단 보조 시스템**입니다. FastAPI 백엔드에서 업무와 AI 분석 결과를 관리하고, Next.js 프런트엔드에서 결과를 시각화합니다.

## 주요 기능

- **업무 등록 및 조회**: Task 생성/조회 API 제공.
- **AI 판단 결과 저장**: 업무와 분리된 AI 분석 엔티티(`AITaskSuggestion`)로 저장.
- **결정 문구 자동 생성**: 팀장 보고, 회의 안건, 결재 문구 생성.
- **UI 카드 시각화**: 인지 부담, 일정 리스크, 협업 판단, 우선순위 조언 등을 카드로 표시.
- **AI 모드 전환**: `AI_MODE=mock|real`로 Mock 또는 OpenAI 호출 전환.

## 기술 스택

- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Database**: PostgreSQL
- **Infra/Dev**: Docker, Docker Compose

## 디렉터리 구조

```
.
├─ backend
│  ├─ app
│  │  ├─ api         # FastAPI 라우터
│  │  ├─ ai          # AI 클라이언트/렌더링
│  │  ├─ context     # 컨텍스트 구성
│  │  ├─ db          # 세션/모델 베이스
│  │  ├─ domain      # 서비스/도메인 로직
│  │  └─ schemas     # API 요청/응답 스키마
│  └─ requirements.txt
├─ frontend
│  └─ src/app        # Next.js App Router
└─ docker-compose.yml
```

## Runtime Flow

1. API 요청 수신 (`POST /api/tasks`)
2. Task 저장 (`Task`, status=CREATED)
3. TaskCreated 이벤트 생성
4. 컨텍스트 구성 (현재 Task + 최근 업무 예시)
5. AI 분석 수행 (Mock 또는 OpenAI)
6. AI 판단 결과 저장 (`AITaskSuggestion`)
7. 응답으로 Task + AI 판단 결과 반환

## API 요약

Base URL: `http://localhost:8000`

### Task 생성

```
POST /api/tasks
```

**Request**

```json
{
  "project_id": 1,
  "title": "업무 제목",
  "description": "업무 상세 설명"
}
```

> `content` 필드는 레거시 호환을 위한 Deprecated 필드이며 `title`로 매핑됩니다.

### Task 목록 조회

```
GET /api/tasks
```

### Task 단건 조회

```
GET /api/tasks/{task_id}
```

### 결정 문구 생성

```
POST /api/tasks/{task_id}/decision-text
```

**Request**

```json
{
  "mode": "leader_brief | meeting_agenda | approval_doc"
}
```

### 헬스 체크

```
GET /health
```

## 로컬 개발

### 1) 데이터베이스 실행

```bash
docker-compose up -d
```

### 2) 백엔드 실행

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3) 프런트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하면 업무 입력 및 AI 판단 결과를 확인할 수 있습니다.

## 환경 변수

백엔드는 `backend/.env`를 사용하며, 기본값은 `backend/app/settings.py`에 정의되어 있습니다.

```
AI_MODE=mock
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=your-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_workflow
DB_USER=ai_user
DB_PASSWORD=ai_pass
```

CORS는 `CORS_ALLOW_ORIGINS`로 제어합니다.

```
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Docker 실행 (외부 접근 허용)

### 1) 외부 IP/도메인 지정

외부에서 접속할 도메인 또는 서버 IP를 준비합니다. 예: `203.0.113.10`

### 2) docker-compose.yml 환경 값 조정

`docker-compose.yml`에서 다음 값을 외부 주소로 변경합니다.

- `frontend` 서비스의 `NEXT_PUBLIC_API_URL`
- `backend` 서비스의 `CORS_ALLOW_ORIGINS`

예시:

```yaml
backend:
  environment:
    CORS_ALLOW_ORIGINS: http://203.0.113.10:3000

frontend:
  build:
    args:
      NEXT_PUBLIC_API_URL: http://203.0.113.10:8000
  environment:
    NEXT_PUBLIC_API_URL: http://203.0.113.10:8000
```

### 3) 실행

```bash
docker compose up --build
```

### 4) 접속

- 프론트엔드: `http://203.0.113.10:3000`
- 백엔드 헬스 체크: `http://203.0.113.10:8000/health`

> 외부 접근을 위해 서버 방화벽/보안그룹에서 `3000`, `8000` 포트를 허용해야 합니다.

## 설계 고려사항

- AI 분석 결과는 업무 엔티티와 분리하여 저장
- 이벤트 기반 처리로 비즈니스 로직과 AI 로직 분리
- AI Client는 Factory 패턴으로 구성하여 확장 가능
