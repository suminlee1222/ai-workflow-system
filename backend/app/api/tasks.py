from fastapi import APIRouter, HTTPException
from app.schemas.task import TaskCreateRequest
from app.schemas.response.task_response import TaskCreateResponse
from app.domain.services.task_service import (
    create_task_service,
    get_task_service,
)
from app.schemas.decision import DecisionRenderRequest, DecisionRenderResponse

router = APIRouter()


@router.post("", response_model=TaskCreateResponse)
def create_task(request: TaskCreateRequest):
    return create_task_service(request)


@router.get("/{task_id}")
def get_task(task_id: int):
    result = get_task_service(task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return result


@router.post(
    "/{task_id}/decision-text",
    response_model=DecisionRenderResponse
)
def render_decision_text(
    task_id: int,
    request: DecisionRenderRequest
):
    """
    AI 분석 결과를 바탕으로
    - 팀장 보고용 문장
    - 회의 안건
    - 결재 문구
    를 생성한다.
    """
    result = render_decision_text_service(
        task_id=task_id,
        mode=request.mode
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Task or AI suggestion not found"
        )

    return result
