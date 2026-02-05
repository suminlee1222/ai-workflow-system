"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { formatEstimate } from "@/lib/utils"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export default function Page() {
  const [content, setContent] = useState("")
  const [taskId, setTaskId] = useState<number | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  /** 업무 생성 + AI 판단 요청 */
  const submit = async () => {
    if (!content.trim()) return

    setLoading(true)
    setResult(null)
    setTaskId(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: 1,
          content,
        }),
      })

      if (!res.ok) {
        throw new Error("요청 실패")
      }

      const data = await res.json()

      setTaskId(data.task.task_id)
      setResult(data.ai_suggestion.result)
    } catch (e) {
      console.error(e)
      alert("요청 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  /** (선택) taskId 기준으로 다시 조회 – 새로고침/확장 대비 */
  useEffect(() => {
    if (!taskId) return

    fetch(`${API_BASE_URL}/api/tasks/${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.ai_suggestion?.result) {
          setResult(data.ai_suggestion.result)
        }
      })
      .catch(() => {})
  }, [taskId])

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* 헤더 */}
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            업무 판단 보조 시스템
          </h1>
          <p className="text-muted-foreground text-base">
            업무를 요약하지 않습니다.
            <br />
            다음 결정을 내리기 위한 <strong>판단 근거</strong>를 제공합니다.
          </p>
        </header>

        {/* 입력 카드 */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>업무 입력</CardTitle>
            <p className="text-sm text-muted-foreground">
              지금 하려는 업무를 자유롭게 적어주세요.
              <br />
              정리가 안 되어 있어도 괜찮습니다.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder={`예시)

결제 요청 중 외부 PG 연동 실패가 자주 발생하고 있음.
현재 예외 처리가 제각각이라 운영 대응이 어렵고,
재시도 정책도 명확하지 않음.

로그 구조를 정리해서
장애 원인 파악과 재발 방지를 하고 싶음.`}
              rows={9}
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              className="resize-none"
            />

            <Button
              className="w-full"
              onClick={submit}
              disabled={!content || loading}
            >
              {loading ? "AI 판단 중..." : "업무 판단 요청"}
            </Button>
          </CardContent>
        </Card>

        {/* 결과 영역 */}
        {result && (
          <Card className="border-l-4 border-blue-500">
            <CardHeader className="space-y-1">
              <CardTitle>AI 판단 결과</CardTitle>
              {taskId && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    업무 ID #{taskId} · 판단 기록 기반
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tasks/${taskId}`}>상세 보기</Link>
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-10">

              {/* 한 줄 요약 */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  업무 성격 요약
                </p>
                <p className="text-base font-semibold">
                  {result.identity?.one_liner}
                </p>
              </div>

              <Separator />

              {/* 판단 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 인지적 부담 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      🧠 인지적 부담
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <Badge variant="secondary">
                      사고 비중: {result.cognitive_load?.thinking_ratio}
                    </Badge>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      {result.cognitive_load?.reason?.map(
                        (r: string, i: number) => (
                          <li key={i}>{r}</li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* 일정 판단 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      ⏱ 일정 판단
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="font-medium">
                      예상 소요 시간:{" "}
                      {formatEstimate(result.time_judgement?.total_estimate)}
                    </p>
                    {result.time_judgement?.estimate_reason?.length ? (
                      <ul className="list-disc pl-5 text-muted-foreground space-y-1">
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
                      일정 리스크: {result.time_judgement?.schedule_risk}
                    </Badge>
                  </CardContent>
                </Card>

                {/* 협업 판단 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      👥 협업 판단
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      주 담당 역할:{" "}
                      <strong>
                        {result.collaboration?.primary_role}
                      </strong>
                    </p>
                    {result.collaboration?.review_required && (
                      <Badge variant="outline">
                        리뷰 필요
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* 우선순위 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      ⚡ 우선순위 조언
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Badge>
                      긴급도: {result.priority_advice?.urgency}
                    </Badge>
                    <p className="text-muted-foreground">
                      {result.priority_advice?.reason}
                    </p>
                  </CardContent>
                </Card>

                {/* 업무 진행 방향 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      🧭 업무 진행 방향
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      {result.work_direction?.summary}
                    </p>
                    {result.work_direction?.next_steps?.length ? (
                      <ul className="list-disc pl-5 text-muted-foreground space-y-1">
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
      </main>
    </div>
  )
}
