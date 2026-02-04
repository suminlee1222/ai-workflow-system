from pydantic import BaseModel
from typing import Literal

DecisionMode = Literal[
    "leader_brief",
    "meeting_agenda",
    "approval_doc"
]


class DecisionRenderRequest(BaseModel):
    mode: DecisionMode


class DecisionRenderResponse(BaseModel):
    text: str
