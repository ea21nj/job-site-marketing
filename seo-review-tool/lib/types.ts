export type CheckStatus = 'pass' | 'warning' | 'fail'
export type AIPriority = 'high' | 'medium' | 'low'

export interface CrawlResult {
  url: string
  title: string
  metaDescription: string
  h1: string[]
  h2Count: number
  hasCanonical: boolean
  hasViewport: boolean
  hasRobotsMeta: boolean
  ogTitle: string
  ogDescription: string
  ogImage: string
  images: { src: string; alt: string }[]
  internalLinks: number
  bodyText: string
}

export interface Recommendation {
  label: string
  detail: string
  status: CheckStatus
}

export interface CategoryScore {
  name: string
  score: number
  weight: number
}

export interface AITip {
  priority: AIPriority
  tip: string
}

export interface AnalyzeResult {
  url: string
  score: number
  categories: CategoryScore[]
  recommendations: Recommendation[]
  aiTips: AITip[]
}

export interface AnalyzeError {
  error: string
}
