import { TaskRequest, TaskResponse } from "@/types/task"

export async function createTask(
  payload: TaskRequest
): Promise<TaskResponse> {
  const res = await fetch("http://localhost:8000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error("Task creation failed")
  }

  return res.json()
}

// src/api/renderDecision.ts
export async function renderDecisionText(
  taskId: number,
  mode: "leader_brief" | "meeting_agenda" | "approval_doc"
): Promise<{ text: string }> {

  const res = await fetch(
    `http://localhost:8000/api/tasks/${taskId}/decision-text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode }),
    }
  )

  if (!res.ok) {
    throw new Error("Decision rendering failed")
  }

  return res.json()
}
