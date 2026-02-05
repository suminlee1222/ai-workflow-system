from app.ai.interface import AIClient
import openai
from app.settings import settings
import json


class OpenAIClient(AIClient):
    def analyze_task(self, context: dict) -> dict:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        task = context.get("task", {}) or {}
        title = task.get("title", "")
        description = task.get("description", "")

        recent_titles = [
            t.get("title")
            for t in (context.get("recent_tasks") or [])
            if t.get("title")
        ]

        recent_context = (
            "\n".join(f"- {t}" for t in recent_titles)
            if recent_titles else "- 없음"
        )

        prompt = f"""
너는 조직 내부에서 사용하는 업무 판단 보조 AI이다.

이 시스템의 목적은 업무를 요약하는 것이 아니라,
사람이 아래 결정을 빠르게 내릴 수 있도록 돕는 것이다.

- 지금 해야 하는가?
- 미뤄도 되는가?
- 혼자 가능한가, 리뷰가 필요한가?
- 일정 리스크가 있는가?

[업무 정보]
- 제목: {title}
- 설명: {description}

[최근 유사 업무]
{recent_context}

아래 JSON 형식으로만 응답하라.
설명 문장이나 마크다운, 코드블록은 절대 사용하지 마라.

값 제약 조건:
- thinking_ratio: 낮음 | 보통 | 높음
- schedule_risk: 낮음 | 보통 | 높음
- urgency: 낮음 | 보통 | 높음
- breakdown은 최소 3단계 이상 작성
- estimate_reason은 예상 소요 시간을 산출한 근거를 간단히 나열

{{
  "identity": {{
    "type": "",
    "one_liner": ""
  }},
  "cognitive_load": {{
    "thinking_ratio": "",
    "reason": []
  }},
  "breakdown": [
    {{
      "step": "",
      "estimated_hours": "",
      "notes": ""
    }}
  ],
  "time_judgement": {{
    "total_estimate": "",
    "estimate_reason": [],
    "schedule_risk": "",
    "risk_reason": []
  }},
  "collaboration": {{
    "primary_role": "",
    "review_required": false,
    "recommended_support": []
  }},
  "priority_advice": {{
    "urgency": "",
    "can_be_deferred": false,
    "reason": ""
  }}
}}
"""

        response = client.responses.create(
            model=settings.OPENAI_MODEL,
            input=prompt
        )

        text = response.output_text.strip()

        # ```json ``` 방어
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        try:
            return json.loads(text)
        except Exception:
            # 절대 UI/DB 깨지지 않게 하는 안전 fallback
            return {
                "identity": {
                    "type": "unknown",
                    "one_liner": "AI 분석 실패"
                },
                "cognitive_load": {
                    "thinking_ratio": "보통",
                    "reason": ["AI 응답 파싱 실패"]
                },
                "breakdown": [],
                "time_judgement": {
                    "total_estimate": "unknown",
                    "estimate_reason": ["AI 응답 파싱 실패"],
                    "schedule_risk": "보통",
                    "risk_reason": []
                },
                "collaboration": {
                    "primary_role": "unknown",
                    "review_required": False,
                    "recommended_support": []
                },
                "priority_advice": {
                    "urgency": "보통",
                    "can_be_deferred": False,
                    "reason": "AI 분석 실패"
                },
                "raw": text
            }
