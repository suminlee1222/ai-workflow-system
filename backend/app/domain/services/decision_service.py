from sqlalchemy import select, desc
from app.db.session import SessionLocal
from app.db.models.ai_task_suggestion import AITaskSuggestion
from app.domain.handlers.task_event_handler import render_task_decision_text
from app.ai.render_modes import DecisionRenderMode


def render_decision_text_service(task_id: int, mode: DecisionRenderMode):
    db = SessionLocal()

    ai_suggestion = db.execute(
        select(AITaskSuggestion)
        .where(AITaskSuggestion.task_id == task_id)
        .order_by(desc(AITaskSuggestion.created_at))
        .limit(1)
    ).scalar_one_or_none()

    if ai_suggestion is None:
        return None

    analysis_result = ai_suggestion.result
    text = render_task_decision_text(
        analysis_result=analysis_result,
        mode=mode
    )

    return {"text": text}
