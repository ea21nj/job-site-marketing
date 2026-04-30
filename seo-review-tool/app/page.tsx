'use client'

import { useState } from 'react'
import { ScoreCircle } from '@/components/ScoreCircle'
import { CategoryCard } from '@/components/CategoryCard'
import { RecommendationItem } from '@/components/RecommendationItem'
import type { AnalyzeResult } from '@/lib/types'

type PageState = 'input' | 'loading' | 'results' | 'error'

const LOADING_MESSAGES = [
  'Fetching page…',
  'Running checks…',
  'Getting AI tips…',
]

export default function Home() {
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState('')
  const [pageState, setPageState] = useState<PageState>('input')
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function validateUrl(raw: string): boolean {
    const trimmed = raw.trim()
    if (!trimmed) return false
    try {
      const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      new URL(withProtocol)
      return true
    } catch {
      return false
    }
  }

  async function handleAnalyze() {
    setValidationError('')
    if (!validateUrl(url)) {
      setValidationError('Please enter a valid URL')
      return
    }

    setPageState('loading')
    setLoadingMessage(LOADING_MESSAGES[0])

    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        const idx = LOADING_MESSAGES.indexOf(prev)
        return LOADING_MESSAGES[Math.min(idx + 1, LOADING_MESSAGES.length - 1)]
      })
    }, 2500)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong.')
        setPageState('error')
      } else {
        setResult(data as AnalyzeResult)
        setPageState('results')
      }
    } catch {
      setErrorMessage("Couldn't connect to the server. Please try again.")
      setPageState('error')
    } finally {
      clearInterval(interval)
    }
  }

  function handleReset() {
    setUrl('')
    setResult(null)
    setErrorMessage('')
    setValidationError('')
    setPageState('input')
  }

  const priorityColor: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600',
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Input state */}
        {(pageState === 'input' || pageState === 'error') && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Reviewer</h1>
            <p className="text-gray-500 mb-8">
              Analyze any webpage's SEO in seconds — free, no signup needed.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={e => { setUrl(e.target.value); setValidationError('') }}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                placeholder="https://yoursite.com/page"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAnalyze}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Analyze
              </button>
            </div>
            {validationError && (
              <p className="text-red-500 text-sm mt-2 text-left">{validationError}</p>
            )}
            {pageState === 'error' && (
              <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
            )}

            {/* Services section */}
            <div className="mt-16 pt-16 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">What We Analyze</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-left bg-white rounded-lg p-6 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">On-Page Basics</h3>
                      <p className="text-sm text-gray-600 mt-1">Title tags, meta descriptions, and H1 headings optimized for search visibility</p>
                    </div>
                  </div>
                </div>

                <div className="text-left bg-white rounded-lg p-6 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">🏗️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Content Structure</h3>
                      <p className="text-sm text-gray-600 mt-1">Heading hierarchy, subheadings, and internal linking strategy</p>
                    </div>
                  </div>
                </div>

                <div className="text-left bg-white rounded-lg p-6 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Technical SEO</h3>
                      <p className="text-sm text-gray-600 mt-1">Viewport settings, canonical tags, and Open Graph meta tags</p>
                    </div>
                  </div>
                </div>

                <div className="text-left bg-white rounded-lg p-6 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">🖼️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Image Accessibility</h3>
                      <p className="text-sm text-gray-600 mt-1">Alt text coverage for better accessibility and image search rankings</p>
                    </div>
                  </div>
                </div>

                <div className="text-left bg-white rounded-lg p-6 border border-gray-100 md:col-span-2">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI-Powered Content Tips</h3>
                      <p className="text-sm text-gray-600 mt-1">Smart recommendations for improving content quality, keyword relevance, and messaging clarity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {pageState === 'loading' && (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">{loadingMessage}</p>
          </div>
        )}

        {/* Results state */}
        {pageState === 'results' && result && (
          <div>
            <p className="text-xs text-gray-400 mb-6 truncate">Results for: {result.url}</p>

            {/* Score */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 flex justify-center">
              <ScoreCircle score={result.score} />
            </div>

            {/* Category cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {result.categories.map(cat => (
                <CategoryCard key={cat.name} category={cat} />
              ))}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 className="font-semibold text-gray-900 mb-4">Recommendations</h2>
              {result.recommendations.map((rec, i) => (
                <RecommendationItem key={i} rec={rec} />
              ))}
            </div>

            {/* AI Tips */}
            {result.aiTips.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="font-semibold text-gray-900 mb-4">AI Content Tips</h2>
                <div className="space-y-3">
                  {result.aiTips.map((tip, i) => (
                    <div key={i} className="flex gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize h-fit mt-0.5 ${priorityColor[tip.priority] ?? ''}`}>
                        {tip.priority}
                      </span>
                      <p className="text-sm text-gray-700">{tip.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Analyze another URL
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
