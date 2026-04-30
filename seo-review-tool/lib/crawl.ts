import * as cheerio from 'cheerio'
import type { CrawlResult } from './types'

export async function crawlPage(url: string): Promise<CrawlResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SEOReviewBot/1.0' },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const html = await res.text()
    const $ = cheerio.load(html)

    const title = $('title').first().text().trim()
    const metaDescription = $('meta[name="description"]').attr('content') ?? ''
    const h1 = $('h1').map((_, el) => $(el).text().trim()).get()
    const h2Count = $('h2').length
    const hasCanonical = $('link[rel="canonical"]').length > 0
    const hasViewport = $('meta[name="viewport"]').length > 0
    const hasRobotsMeta = $('meta[name="robots"]').length > 0
    const ogTitle = $('meta[property="og:title"]').attr('content') ?? ''
    const ogDescription = $('meta[property="og:description"]').attr('content') ?? ''
    const ogImage = $('meta[property="og:image"]').attr('content') ?? ''

    const images = $('img')
      .map((_, el) => ({ src: $(el).attr('src') ?? '', alt: $(el).attr('alt') ?? '' }))
      .get()

    const base = new URL(url)
    const internalLinks = $('a[href]')
      .filter((_, el) => {
        const href = $(el).attr('href') ?? ''
        return href.startsWith('/') || href.includes(base.hostname)
      })
      .length

    $('script, style, nav, footer, header').remove()
    const bodyText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 500)
      .join(' ')

    return {
      url,
      title,
      metaDescription,
      h1,
      h2Count,
      hasCanonical,
      hasViewport,
      hasRobotsMeta,
      ogTitle,
      ogDescription,
      ogImage,
      images,
      internalLinks,
      bodyText,
    }
  } finally {
    clearTimeout(timeout)
  }
}
