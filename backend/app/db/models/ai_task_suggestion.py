from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class AITaskSuggestion(Base):
    __tablename__ = "ai_task_suggestions"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    result = Column(JSON, nullable=False)
    model = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
