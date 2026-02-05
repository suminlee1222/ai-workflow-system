# app/schemas/task.py
from pydantic import BaseModel, Field, root_validator

class TaskCreateRequest(BaseModel):
    project_id: int
    title: str
    content: str | None = Field(
        None,
        description="Deprecated. Use title instead."
    )

    @root_validator(pre=True)
    def map_content_to_title(cls, values):
        if not values.get("title") and values.get("content"):
            values["title"] = values["content"]
        return values
