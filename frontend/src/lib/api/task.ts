import { TaskResponse } from "@/types/task"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function getTask(taskId: number): Promise<TaskResponse> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`)

  if (!res.ok) {
    throw new Error("Task fetch failed")
  }

  return res.json()
}
