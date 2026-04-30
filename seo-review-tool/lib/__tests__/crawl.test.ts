import { crawlPage } from '../crawl'

const MINIMAL_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <meta name="description" content="A test description that is long enough to pass checks easily.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="Test OG Title">
  <meta property="og:description" content="Test OG desc">
  <meta property="og:image" content="https://example.com/img.jpg">
</head>
<body>
  <h1>Main Heading</h1>
  <h2>Subheading</h2>
  <p>Body text content here.</p>
  <img src="photo.jpg" alt="A photo">
  <img src="icon.png" alt="">
  <a href="/about">About</a>
  <a href="https://example.com/contact">Contact</a>
</body>
</html>`

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: async () => MINIMAL_HTML,
  } as unknown as Response)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('crawlPage', () => {
  it('extracts title', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.title).toBe('Test Page')
  })

  it('extracts meta description', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.metaDescription).toContain('A test description')
  })

  it('extracts H1 array', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.h1).toEqual(['Main Heading'])
  })

  it('counts H2 headings', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.h2Count).toBe(1)
  })

  it('detects canonical tag', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.hasCanonical).toBe(true)
  })

  it('detects viewport meta tag', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.hasViewport).toBe(true)
  })

  it('extracts Open Graph tags', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.ogTitle).toBe('Test OG Title')
    expect(result.ogImage).toBe('https://example.com/img.jpg')
  })

  it('extracts images with alt attributes', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.images).toHaveLength(2)
    expect(result.images[0].alt).toBe('A photo')
    expect(result.images[1].alt).toBe('')
  })

  it('counts internal links', async () => {
    const result = await crawlPage('https://example.com')
    expect(result.internalLinks).toBeGreaterThanOrEqual(1)
  })

  it('throws on non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 } as Response)
    await expect(crawlPage('https://example.com')).rejects.toThrow('HTTP 404')
  })
})
