from abc import ABC, abstractmethod

class AIClient(ABC):
    @abstractmethod
    def analyze_task(self, context: dict) -> dict:
        pass
