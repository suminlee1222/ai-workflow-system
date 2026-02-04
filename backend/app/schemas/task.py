# app/schemas/task.py
from pydantic import BaseModel

class TaskCreateRequest(BaseModel):
    project_id: int
    content: str
