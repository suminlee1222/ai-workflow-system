## Architecture Overview

이 프로젝트는 “업무 판단 보조”를 목표로 하며, 입력된 업무(Task)를 저장한 뒤
AI 분석 결과를 별도 엔티티로 저장하고 조회합니다. 프런트엔드는 결과를 카드
형식으로 시각화하여 의사결정에 필요한 핵심 정보를 빠르게 확인할 수 있습니다.

- API Layer: `backend/app/api`
- Service / Domain Layer: `backend/app/domain`
- AI Integration Layer: `backend/app/ai`
- Context Builder: `backend/app/context`
- Persistence Layer: `backend/app/db`
- UI Layer: `frontend/src/app`

## Runtime Flow

Task 생성 요청이 들어오면 다음 흐름으로 처리됩니다.

1. API 요청 수신 (`POST /api/tasks`)
2. Task 저장 (`Task` 엔티티, status=CREATED)
3. TaskCreated 이벤트 생성
4. 컨텍스트 구성 (현재 Task + 최근 업무 예시)
5. AI 분석 수행 (Mock 또는 OpenAI)
6. AI 판단 결과 저장 (`AITaskSuggestion`)
7. 응답으로 Task + AI 판단 결과 반환

## Feature Highlights

- **AI 모드 전환**: `AI_MODE=mock|real` 설정으로 Mock 응답 또는 OpenAI 호출을 선택합니다.
- **결정 문구 렌더링**: 저장된 분석 결과를 기반으로 팀장 보고/회의 안건/결재 문구를 생성합니다.
- **UI 시각화**: 인지 부담, 일정 리스크, 협업 판단, 우선순위 조언 등을 카드로 제공합니다.

## API Endpoints

### 1) Task 생성

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

> `content` 필드는 기존 호환을 위한 Deprecated 필드이며 `title`로 매핑됩니다.

**Response 요약**

- `task`: 저장된 Task 정보
- `ai_suggestion`: AI 판단 결과 및 모델 정보

### 2) Task 조회

```
GET /api/tasks/{task_id}
```

Task와 최신 AI 판단 결과를 반환합니다.

### 3) 결정 문구 생성

```
POST /api/tasks/{task_id}/decision-text
```

**Request**

```json
{
  "mode": "leader_brief | meeting_agenda | approval_doc"
}
```

**Response**

```json
{
  "text": "요청 모드에 맞춘 결정 문구"
}
```

## Data Model

- `Task`
  - `project_id`, `title`, `description`, `status`
- `AITaskSuggestion`
  - `task_id`, `result`(JSON), `model`, `created_at`

## Local Development

### 1) 데이터베이스 실행

```bash
docker-compose up -d
```

### 2) 백엔드 실행

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3) 프런트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하면 업무 입력 및 AI 판단 결과를 확인할 수 있습니다.

## Configuration

환경 변수는 `backend/.env`에 설정할 수 있습니다.

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

## Design Considerations

- AI 분석 결과는 업무 엔티티와 분리하여 저장
- 이벤트 기반 처리로 비즈니스 로직과 AI 로직 분리
- AI Client는 Factory 패턴으로 구성하여 확장 가능

## Docker 실행 (외부 접근 허용)

아래 방법으로 Postgres + FastAPI + Next.js를 도커로 띄우고, 외부에서 접근할 수 있도록 설정합니다.

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

### 참고

외부에서 접근하려면 서버 방화벽/보안그룹에서 `3000`, `8000` 포트를 열어야 합니다.
