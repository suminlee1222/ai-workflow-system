from contextlib import contextmanager

from sqlalchemy import select, desc
from app.db.session import SessionLocal
from app.db.models.task import Task as TaskModel
from app.db.models.ai_task_suggestion import AITaskSuggestion
from app.schemas.task import TaskCreateRequest
from app.domain.events.task_events import TaskCreatedEvent
from app.domain.handlers.task_event_handler import handle_task_created


@contextmanager
def session_scope():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def commit_with_rollback(db):
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


def create_task_service(request: TaskCreateRequest):
    with session_scope() as db:
        # 1. Task 저장
        task = TaskModel(
            project_id=request.project_id,
            title=request.title,
            description=None,
            status="CREATED"
        )
        db.add(task)
        commit_with_rollback(db)
        db.refresh(task)

        # 2. 이벤트 생성
        event = TaskCreatedEvent(
            task_id=task.id,
            project_id=task.project_id,
            title=task.title
        )

        # 3. AI 판단 수행
        ai_suggestion = handle_task_created(event)

        # 4. AI 판단 결과 저장
        db.add(ai_suggestion)
        commit_with_rollback(db)
        db.refresh(ai_suggestion)

        return {
            "task": {
                "task_id": task.id,
                "project_id": task.project_id,
                "title": task.title,
                "status": task.status
            },
            "ai_suggestion": {
                "task_id": ai_suggestion.task_id,
                "result": ai_suggestion.result,
                "model": ai_suggestion.model,
                "created_at": ai_suggestion.created_at
            }
        }


def get_task_service(task_id: int):
    with session_scope() as db:
        task = db.execute(
            select(TaskModel).where(TaskModel.id == task_id)
        ).scalar_one_or_none()

        if task is None:
            return None

        ai_suggestion = db.execute(
            select(AITaskSuggestion)
            .where(AITaskSuggestion.task_id == task_id)
            .order_by(desc(AITaskSuggestion.created_at))
            .limit(1)
        ).scalar_one_or_none()

        return {
            "task": {
                "task_id": task.id,
                "project_id": task.project_id,
                "title": task.title,
                "status": task.status
            },
            "ai_suggestion": {
                "task_id": ai_suggestion.task_id,
                "result": ai_suggestion.result,
                "model": ai_suggestion.model,
                "created_at": ai_suggestion.created_at
            } if ai_suggestion else None
        }


def get_tasks_service():
    with session_scope() as db:
        tasks = db.execute(
            select(TaskModel).order_by(desc(TaskModel.id))
        ).scalars().all()

        return {
            "tasks": [
                {
                    "task_id": task.id,
                    "project_id": task.project_id,
                    "title": task.title,
                    "status": task.status
                }
                for task in tasks
            ]
        }
