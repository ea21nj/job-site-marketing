import type { CrawlResult, Recommendation, CategoryScore } from './types'

function scoreCategory(checks: Recommendation[]): number {
  if (checks.length === 0) return 100
  const passed = checks.filter(c => c.status === 'pass').length
  const warned = checks.filter(c => c.status === 'warning').length
  return Math.round(((passed * 1 + warned * 0.5) / checks.length) * 100)
}

export function runChecks(data: CrawlResult): {
  recommendations: Recommendation[]
  categories: CategoryScore[]
} {
  const onPage: Recommendation[] = []
  const structure: Recommendation[] = []
  const technical: Recommendation[] = []
  const images: Recommendation[] = []

  if (!data.title) {
    onPage.push({ label: 'Missing page title', detail: 'Add a <title> tag to your page.', status: 'fail' })
  } else if (data.title.length < 50) {
    onPage.push({ label: `Title too short (${data.title.length} chars)`, detail: 'Aim for 50–60 characters.', status: 'warning' })
  } else if (data.title.length > 60) {
    onPage.push({ label: `Title too long (${data.title.length} chars)`, detail: 'Keep it under 60 characters to avoid search result truncation.', status: 'warning' })
  } else {
    onPage.push({ label: `Title length is good (${data.title.length} chars)`, detail: 'Title is within the ideal 50–60 character range.', status: 'pass' })
  }

  if (!data.metaDescription) {
    onPage.push({ label: 'Missing meta description', detail: 'Add a <meta name="description"> with 150–160 characters.', status: 'fail' })
  } else if (data.metaDescription.length < 150) {
    onPage.push({ label: `Meta description too short (${data.metaDescription.length} chars)`, detail: 'Aim for 150–160 characters.', status: 'warning' })
  } else if (data.metaDescription.length > 160) {
    onPage.push({ label: `Meta description too long (${data.metaDescription.length} chars)`, detail: 'Keep it under 160 characters.', status: 'warning' })
  } else {
    onPage.push({ label: `Meta description length is good (${data.metaDescription.length} chars)`, detail: 'Meta description is within the ideal range.', status: 'pass' })
  }

  if (data.h1.length === 0) {
    onPage.push({ label: 'Missing H1 tag', detail: 'Add exactly one H1 heading to your page.', status: 'fail' })
  } else if (data.h1.length > 1) {
    onPage.push({ label: `Multiple H1 tags found (${data.h1.length})`, detail: 'Use only one H1 per page.', status: 'warning' })
  } else {
    onPage.push({ label: 'H1 tag present', detail: 'Page has exactly one H1 heading.', status: 'pass' })
  }

  if (data.h2Count === 0) {
    structure.push({ label: 'No H2 headings found', detail: 'Use H2 headings to structure your content for readers and search engines.', status: 'warning' })
  } else {
    structure.push({ label: `${data.h2Count} H2 heading(s) found`, detail: 'Good use of subheadings to structure content.', status: 'pass' })
  }

  if (data.internalLinks === 0) {
    structure.push({ label: 'No internal links found', detail: 'Add links to other pages on your site to improve navigation and crawlability.', status: 'warning' })
  } else {
    structure.push({ label: `${data.internalLinks} internal link(s) found`, detail: 'Good internal linking structure.', status: 'pass' })
  }

  if (!data.hasViewport) {
    technical.push({ label: 'Missing viewport meta tag', detail: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile optimization.', status: 'fail' })
  } else {
    technical.push({ label: 'Viewport meta tag present', detail: 'Page is configured for mobile devices.', status: 'pass' })
  }

  if (!data.hasCanonical) {
    technical.push({ label: 'Missing canonical tag', detail: 'Add a <link rel="canonical"> to prevent duplicate content issues.', status: 'warning' })
  } else {
    technical.push({ label: 'Canonical tag present', detail: 'Canonical URL is properly defined.', status: 'pass' })
  }

  const ogCount = [data.ogTitle, data.ogDescription, data.ogImage].filter(Boolean).length
  if (ogCount === 0) {
    technical.push({ label: 'Missing Open Graph tags', detail: 'Add og:title, og:description, and og:image for better social sharing previews.', status: 'warning' })
  } else if (ogCount < 3) {
    technical.push({ label: `Incomplete Open Graph tags (${ogCount}/3)`, detail: 'Add all three: og:title, og:description, and og:image.', status: 'warning' })
  } else {
    technical.push({ label: 'Open Graph tags complete', detail: 'All three OG tags (title, description, image) are present.', status: 'pass' })
  }

  if (data.images.length === 0) {
    images.push({ label: 'No images found', detail: 'Consider adding relevant images to improve engagement.', status: 'warning' })
  } else {
    const withAlt = data.images.filter(img => img.alt.trim().length > 0).length
    const pct = Math.round((withAlt / data.images.length) * 100)
    if (pct === 100) {
      images.push({ label: `All ${data.images.length} image(s) have alt text`, detail: 'Great image accessibility.', status: 'pass' })
    } else if (pct >= 50) {
      images.push({ label: `${withAlt}/${data.images.length} images have alt text (${pct}%)`, detail: 'Add alt text to all images for accessibility and SEO.', status: 'warning' })
    } else {
      images.push({ label: `Only ${withAlt}/${data.images.length} images have alt text (${pct}%)`, detail: 'Most images are missing alt text — add descriptive alt attributes.', status: 'fail' })
    }
  }

  const categories: CategoryScore[] = [
    { name: 'On-Page Basics', score: scoreCategory(onPage), weight: 0.35 },
    { name: 'Content Structure', score: scoreCategory(structure), weight: 0.25 },
    { name: 'Technical', score: scoreCategory(technical), weight: 0.25 },
    { name: 'Image Accessibility', score: scoreCategory(images), weight: 0.15 },
  ]

  const order = { fail: 0, warning: 1, pass: 2 }
  const recommendations = [...onPage, ...structure, ...technical, ...images].sort(
    (a, b) => order[a.status] - order[b.status]
  )

  return { recommendations, categories }
}

export function computeOverallScore(categories: CategoryScore[]): number {
  return Math.round(categories.reduce((sum, c) => sum + c.score * c.weight, 0))
}
