// src/types/decision.ts
export type DecisionRenderMode =
  | "leader_brief"
  | "meeting_agenda"
  | "approval_doc"

export interface DecisionTextResponse {
  text: string
}
