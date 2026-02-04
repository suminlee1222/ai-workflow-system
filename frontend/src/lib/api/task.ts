import { TaskResponse } from "@/types/task"

export async function getTask(taskId: number): Promise<TaskResponse> {
  const res = await fetch(`http://localhost:8000/api/tasks/${taskId}`)

  if (!res.ok) {
    throw new Error("Task fetch failed")
  }

  return res.json()
}
