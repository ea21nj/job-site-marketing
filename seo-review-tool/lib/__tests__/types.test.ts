import type { Recommendation, CategoryScore, AITip, AnalyzeResult } from '../types'

describe('types', () => {
  it('Recommendation status values are valid', () => {
    const statuses = ['pass', 'warning', 'fail']
    const rec: Recommendation = { label: 'Test', detail: 'Detail', status: 'pass' }
    expect(statuses).toContain(rec.status)
  })

  it('CategoryScore weight is a number', () => {
    const cat: CategoryScore = { name: 'On-Page Basics', score: 80, weight: 0.35 }
    expect(typeof cat.weight).toBe('number')
  })

  it('AITip priority values are valid', () => {
    const priorities = ['high', 'medium', 'low']
    const tip: AITip = { priority: 'high', tip: 'Fix your title' }
    expect(priorities).toContain(tip.priority)
  })
})
