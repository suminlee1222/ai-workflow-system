# app/ai/render_modes.py
from enum import Enum

class DecisionRenderMode(str, Enum):
    LEADER_BRIEF = "leader_brief"     # 팀장 보고용
    MEETING_AGENDA = "meeting_agenda" # 회의 안건용
    APPROVAL_DOC = "approval_doc"     # 결재 문서용
