export interface TaskRequest {
  project_id: number
  title: string
  description: string
}

export interface AITaskAnalysis {
  identity: {
    type: string
    one_liner: string
  }
  cognitive_load: {
    thinking_ratio: "낮음" | "보통" | "높음"
    reason: string[]
  }
  breakdown: {
    step: string
    estimated_hours: string
    notes: string
  }[]
  time_judgement: {
    total_estimate: string
    estimate_reason: string[]
    schedule_risk: "낮음" | "보통" | "높음"
    risk_reason: string[]
  }
  collaboration: {
    primary_role: string
    review_required: boolean
    recommended_support: string[]
  }
  priority_advice: {
    urgency: "낮음" | "보통" | "높음"
    can_be_deferred: boolean
    reason: string
  }
  work_direction: {
    summary: string
    next_steps: string[]
  }
}

export interface AISuggestion {
  task_id: number
  result: AITaskAnalysis
  model: string
  created_at: string
}

export interface TaskResponse {
  task: {
    task_id: number
    project_id: number
    title: string
    description: string
    status: string
  }
  ai_suggestion: AISuggestion
}
