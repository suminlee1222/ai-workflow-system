# app/ai/decision_renderer.py
from abc import ABC, abstractmethod
from app.ai.render_modes import DecisionRenderMode

class DecisionRenderer(ABC):

    @abstractmethod
    def render(
        self,
        analysis_result: dict,
        mode: DecisionRenderMode
    ) -> str:
        pass
