from dataclasses import dataclass
from datetime import datetime

@dataclass
class AITaskSuggestion:
    task_id: int
    result: dict
    model: str
    created_at: datetime
