# app/ai/openai_decision_renderer.py
import openai
from app.settings import settings
from app.ai.render_modes import DecisionRenderMode

class OpenAIDecisionRenderer:

    def render(self, analysis_result: dict, mode: DecisionRenderMode) -> str:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        system_prompt = """
너는 조직 내부의 의사결정을 돕는 AI이다.
업무를 다시 분석하거나 평가하지 않는다.
주어진 분석 결과를 바탕으로,
요청된 상황에 맞는 '표현'만 생성한다.
"""

        mode_instruction = {
            DecisionRenderMode.LEADER_BRIEF: """
팀장에게 구두 또는 슬랙으로 보고하는 문장으로 작성하라.
간결하지만 판단 근거가 드러나야 한다.
""",
            DecisionRenderMode.MEETING_AGENDA: """
회의 안건 문서 형태로 작성하라.
논의 포인트와 결정 항목 위주로 정리하라.
""",
            DecisionRenderMode.APPROVAL_DOC: """
결재 문서에 들어갈 공식적인 문장으로 작성하라.
왜 승인해야 하는지가 명확해야 한다.
"""
        }[mode]

        prompt = f"""
[업무 분석 결과]
{analysis_result}

[작성 지침]
{mode_instruction}

자연스러운 한국어 문장으로만 출력하라.
목록 또는 단락 형식은 상황에 맞게 선택하라.
"""

        response = client.responses.create(
            model=settings.OPENAI_MODEL,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ]
        )

        return response.output_text.strip()
