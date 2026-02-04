from app.ai.interface import AIClient

class MockAIClient(AIClient):
    def analyze_task(self, context: dict) -> dict:
        return {
            "category": "기획",
            "tags": ["마케팅", "랜딩페이지"],
            "estimated_hours": "8~12"
        }
