import Anthropic from '@anthropic-ai/sdk'
import type { CrawlResult, AITip } from './types'

const client = new Anthropic()

export async function getAITips(data: CrawlResult): Promise<AITip[]> {
  const prompt = `You are an SEO content expert. Analyze this webpage's content and give 3–5 specific, actionable tips to improve its SEO quality.

Page title: ${data.title || '(missing)'}
Meta description: ${data.metaDescription || '(missing)'}
H1: ${data.h1[0] || '(missing)'}
Body text excerpt: ${data.bodyText}

Focus on content quality, keyword relevance, and messaging clarity — not technical HTML issues.
For each tip, assign priority: "high", "medium", or "low".
Respond ONLY with a JSON array, no other text:
[{"priority":"high","tip":"..."},{"priority":"medium","tip":"..."}]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []

  try {
    return JSON.parse(match[0]) as AITip[]
  } catch {
    return []
  }
}
