export interface Brand {
  id: string
  title?: string | null
  stage: string
  description: string
  audience_report: Record<string, unknown> | null
  roadmap: Array<{ phase: string; timeframe: string; steps: string[]; tools: string[] }> | null
  marketing_plan: Record<string, unknown> | null
  plan?: string | null
}

export interface UserData {
  id: string
  email: string
  name: string
}
