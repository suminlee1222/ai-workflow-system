"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

type TaskSummary = {
  task_id: number
  project_id: number
  title: string
  status: string
}

type TaskListResponse = {
  tasks: TaskSummary[]
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetch(`${API_BASE_URL}/api/tasks`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("업무 목록을 불러오지 못했습니다.")
        }
        return res.json()
      })
      .then((data: TaskListResponse) => {
        if (!isMounted) return
        setTasks(data.tasks ?? [])
      })
      .catch((err: Error) => {
        if (!isMounted) return
        setError(err.message)
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              업무 목록
            </h1>
            <Button asChild variant="outline">
              <Link href="/">업무 입력</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-base">
            생성된 모든 업무를 확인하고 상세 페이지로 이동할 수
            있습니다.
          </p>
        </header>

        {loading && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              업무 목록을 불러오는 중입니다...
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card className="border-l-4 border-red-500">
            <CardHeader>
              <CardTitle>오류</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && tasks.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              아직 생성된 업무가 없습니다.
            </CardContent>
          </Card>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.task_id}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">
                    {task.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    업무 ID #{task.task_id}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline">{task.status}</Badge>
                    <Button asChild size="sm">
                      <Link href={`/tasks/${task.task_id}`}>
                        상세 보기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
