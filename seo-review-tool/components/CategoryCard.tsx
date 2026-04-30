import type { CategoryScore } from '@/lib/types'

export function CategoryCard({ category }: { category: CategoryScore }) {
  const colorClass =
    category.score >= 80
      ? 'text-green-600 bg-green-50 border-green-200'
      : category.score >= 60
      ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
      : 'text-red-600 bg-red-50 border-red-200'

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <div className="text-2xl font-bold">{category.score}</div>
      <div className="text-sm text-gray-600 mt-1">{category.name}</div>
    </div>
  )
}
