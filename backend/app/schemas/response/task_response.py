from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class AITaskSuggestionResponse(BaseModel):
    task_id: int
    result: dict
    model: str
    created_at: datetime

class TaskResponse(BaseModel):
    task_id: int
    project_id: int
    title: str
    description: Optional[str]
    status: str

class TaskCreateResponse(BaseModel):
    task: TaskResponse
    ai_suggestion: AITaskSuggestionResponse
