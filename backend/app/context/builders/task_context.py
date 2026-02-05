from app.domain.events.task_events import TaskCreatedEvent

class TaskContextBuilder:
    def build(self, event: TaskCreatedEvent) -> dict:
        return {
            "task": {
                "task_id": event.task_id,
                "project_id": event.project_id,
                "title": event.title,
            },
            "recent_tasks": [
                {"title": "이전 랜딩페이지 기획"},
                {"title": "콘텐츠 일정 정리"}
            ]
        }
