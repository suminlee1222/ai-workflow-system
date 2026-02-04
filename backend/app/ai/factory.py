from app.ai.mock_client import MockAIClient
from app.ai.real_client import OpenAIClient
from app.settings import settings

def get_ai_client():
    if settings.AI_MODE == "real":
        return OpenAIClient()
    return MockAIClient()