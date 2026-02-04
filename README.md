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
