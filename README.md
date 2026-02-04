## Architecture Overview

이 프로젝트는 역할과 책임에 따라 레이어를 명확히 분리했습니다.

- API Layer: app/api
- Service / Domain Layer: app/domain
- AI Integration Layer: app/ai
- Context Builder: app/context
- Persistence Layer: app/db

## Workflow

Task 생성 요청이 들어오면 다음 흐름으로 처리됩니다.

1. API 요청 수신 (`app/api`)
2. Task 생성 및 저장 (`app/domain/services`)
3. TaskCreated 이벤트 발생 (`app/domain/events`)
4. AI 분석 수행 (`app/ai`)
5. AI 결과 저장 (`app/db`)

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
