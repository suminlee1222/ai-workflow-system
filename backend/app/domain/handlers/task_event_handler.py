from datetime import datetime
from app.domain.events.task_events import TaskCreatedEvent
from app.context.builders.task_context import TaskContextBuilder
from app.ai.factory import get_ai_client
from app.db.models.ai_task_suggestion import AITaskSuggestion
from app.settings import settings
from app.ai.openai_decision_renderer import OpenAIDecisionRenderer
from app.ai.render_modes import DecisionRenderMode

def handle_task_created(event: TaskCreatedEvent) -> AITaskSuggestion:
    context = TaskContextBuilder().build(event)

    ai_client = get_ai_client()
    result = ai_client.analyze_task(context)

    return AITaskSuggestion(
        task_id=event.task_id,
        result=result,
        model=settings.OPENAI_MODEL,
        created_at=datetime.utcnow()
    )

def render_task_decision_text(
    analysis_result: dict,
    mode: DecisionRenderMode
) -> str:
    renderer = OpenAIDecisionRenderer()
    return renderer.render(analysis_result, mode)
