import { NextRequest, NextResponse } from 'next/server'
import { crawlPage } from '@/lib/crawl'
import { runChecks, computeOverallScore } from '@/lib/rules'
import { getAITips } from '@/lib/ai'
import type { AnalyzeResult } from '@/lib/types'

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { url: rawUrl } = body as { url?: string }

  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const urlStr = normalizeUrl(rawUrl)
  let parsed: URL
  try {
    parsed = new URL(urlStr)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const crawlData = await crawlPage(parsed.toString())
    const { recommendations, categories } = runChecks(crawlData)
    const score = computeOverallScore(categories)

    let aiTips: AnalyzeResult['aiTips'] = []
    try {
      aiTips = await getAITips(crawlData)
    } catch {
      // AI tips fail silently
    }

    const result: AnalyzeResult = {
      url: parsed.toString(),
      score,
      categories,
      recommendations,
      aiTips,
    }
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('abort') || msg.toLowerCase().includes('timeout')) {
      return NextResponse.json({ error: 'The page took too long to respond.' }, { status: 504 })
    }
    if (msg.includes('403') || msg.toLowerCase().includes('forbidden')) {
      return NextResponse.json({ error: 'This site blocked the request. Try a different page.' }, { status: 403 })
    }
    return NextResponse.json({ error: "Couldn't reach that page. Check the URL and try again." }, { status: 502 })
  }
}
