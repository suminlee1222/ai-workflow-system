from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any

@dataclass
class AITaskAnalysis:
    task_id: int
    result: Dict[str, Any]
    model: str
    created_at: datetime
