from dataclasses import dataclass

@dataclass
class TaskCreatedEvent:
    def __init__(
        self,
        task_id: int,
        project_id: int,
        title: str,
    ):
        self.task_id = task_id
        self.project_id = project_id
        self.title = title
