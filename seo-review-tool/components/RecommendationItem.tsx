import type { Recommendation } from '@/lib/types'

const STATUS_ICON: Record<Recommendation['status'], string> = {
  pass: '✅',
  warning: '⚠️',
  fail: '❌',
}

export function RecommendationItem({ rec }: { rec: Recommendation }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-lg leading-none mt-0.5">{STATUS_ICON[rec.status]}</span>
      <div>
        <div className="font-medium text-gray-900 text-sm">{rec.label}</div>
        <div className="text-gray-500 text-sm mt-0.5">{rec.detail}</div>
      </div>
    </div>
  )
}
