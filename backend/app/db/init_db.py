from app.db.base import Base
from app.db.session import engine
# 모델 import는 "등록" 목적
from app.db.models.task import Task
from app.db.models.ai_task_suggestion import AITaskSuggestion

def init_db():
    Base.metadata.create_all(bind=engine)
