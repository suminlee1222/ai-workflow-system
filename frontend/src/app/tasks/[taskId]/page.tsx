"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DecisionRenderMode } from "@/types/decision"
import { TaskResponse } from "@/types/task"
import { formatEstimate } from "@/lib/utils"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

type TaskDetail = TaskResponse & {
  task?: {
    content?: string
    title?: string
  }
}

const modeLabels: Record<DecisionRenderMode, string> = {
  leader_brief: "리더 브리프",
  meeting_agenda: "회의 아젠다",
  approval_doc: "결재 문서",
}

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = useMemo(() => {
    const raw = params?.taskId
    if (Array.isArray(raw)) return Number(raw[0])
    return raw ? Number(raw) : NaN
  }, [params])

  const [data, setData] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decisionMode, setDecisionMode] =
    useState<DecisionRenderMode>("leader_brief")
  const [decisionText, setDecisionText] = useState<string | null>(null)
  const [decisionLoading, setDecisionLoading] = useState(false)
  const [decisionError, setDecisionError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(taskId)) {
      setError("유효하지 않은 업무 ID입니다.")
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    fetch(`${API_BASE_URL}/api/tasks/${taskId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("업무를 찾을 수 없습니다.")
          }
          throw new Error("업무 정보를 불러오지 못했습니다.")
        }
        return res.json()
      })
      .then((task) => {
        if (!isMounted) return
        setData(task)
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
  }, [taskId])

  const submitDecision = async () => {
    if (!Number.isFinite(taskId)) return

    setDecisionLoading(true)
    setDecisionError(null)
    setDecisionText(null)

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/decision-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mode: decisionMode }),
        }
      )

      if (!res.ok) {
        throw new Error("의사결정 문서 생성에 실패했습니다.")
      }

      const response = (await res.json()) as { text?: string }
      setDecisionText(response.text ?? "")
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "의사결정 문서 생성 중 오류가 발생했습니다."
      setDecisionError(message)
    } finally {
      setDecisionLoading(false)
    }
  }

  const result = data?.ai_suggestion?.result
  const taskContent =
    data?.task?.content || data?.task?.title || ""

  return (
    <div className="min-h-screen bg-gradient-to-b from-white/80 via-neutral-100 to-neutral-200/60">
      <main className="mx-auto w-full max-w-5xl space-y-12 px-6 py-12">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              업무 상세
            </h1>
            <Button asChild variant="outline">
              <Link href="/tasks">목록으로</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-base">
            업무 내용과 기존 AI 판단 결과, 그리고 의사결정 문서
            생성을 확인할 수 있습니다.
          </p>
        </header>

        {loading && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              업무 정보를 불러오는 중입니다...
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

        {!loading && !error && data && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>업무 내용</CardTitle>
                <p className="text-xs text-muted-foreground">
                  업무 ID #{data.task?.task_id ?? taskId}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {taskContent || "등록된 업무 내용이 없습니다."}
                </p>
              </CardContent>
            </Card>

            {result && (
              <Card className="border border-neutral-200/70 bg-white shadow-sm">
                <CardHeader className="space-y-2 border-b border-neutral-200/60">
                  <CardTitle className="text-base font-semibold text-neutral-900">
                    기존 AI 판단 결과
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    기존 판단 기록을 기반으로 표시됩니다.
                  </p>
                </CardHeader>

                <CardContent className="space-y-10 pt-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      업무 성격 요약
                    </p>
                    <p className="text-base font-semibold text-neutral-900">
                      {result.identity?.one_liner}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card className="border border-neutral-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-neutral-900">
                          🧠 인지적 부담
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-neutral-700">
                        <Badge variant="outline">
                          사고 비중:{" "}
                          {result.cognitive_load?.thinking_ratio}
                        </Badge>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {result.cognitive_load?.reason?.map(
                            (r: string, i: number) => (
                              <li key={i}>{r}</li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border border-neutral-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-neutral-900">
                          ⏱ 일정 판단
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-neutral-700">
                        <p className="text-sm font-semibold text-neutral-800">
                          예상 소요 시간:{" "}
                          {formatEstimate(
                            result.time_judgement?.total_estimate
                          )}
                        </p>
                        {result.time_judgement?.estimate_reason?.length ? (
                          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {result.time_judgement.estimate_reason.map(
                              (reason: string, index: number) => (
                                <li key={index}>{reason}</li>
                              )
                            )}
                          </ul>
                        ) : null}
                        <Badge
                          variant={
                            result.time_judgement?.schedule_risk === "높음"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          일정 리스크:{" "}
                          {result.time_judgement?.schedule_risk}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card className="border border-neutral-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-neutral-900">
                          ⚡ 우선순위 조언
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-neutral-700">
                        <Badge variant="outline">
                          긴급도: {result.priority_advice?.urgency}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {result.priority_advice?.reason}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border border-neutral-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-neutral-900">
                          🧭 업무 진행 방향
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-neutral-700">
                        <p className="text-sm text-muted-foreground">
                          {result.work_direction?.summary}
                        </p>
                        {result.work_direction?.next_steps?.length ? (
                          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {result.work_direction.next_steps.map(
                              (step: string, index: number) => (
                                <li key={index}>{step}</li>
                              )
                            )}
                          </ul>
                        ) : null}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Decision-text 생성</CardTitle>
                <p className="text-xs text-muted-foreground">
                  모드를 선택한 뒤 의사결정 문서를 생성합니다.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="decision-mode"
                    className="text-sm font-medium"
                  >
                    모드 선택
                  </label>
                  <select
                    id="decision-mode"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={decisionMode}
                    onChange={(event) =>
                      setDecisionMode(
                        event.target.value as DecisionRenderMode
                      )
                    }
                    disabled={decisionLoading}
                  >
                    {(
                      Object.keys(
                        modeLabels
                      ) as DecisionRenderMode[]
                    ).map((mode) => (
                      <option key={mode} value={mode}>
                        {modeLabels[mode]}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  className="w-full"
                  onClick={submitDecision}
                  disabled={decisionLoading}
                >
                  {decisionLoading ? "생성 중..." : "생성"}
                </Button>

                {decisionError && (
                  <p className="text-sm text-red-500">
                    {decisionError}
                  </p>
                )}

                {decisionText && (
                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-base">
                        생성 결과
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {decisionText}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
