interface ScoreCircleProps {
  score: number
}

export function ScoreCircle({ score }: ScoreCircleProps) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'
  const r = 40
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50" y="50"
          textAnchor="middle" dominantBaseline="central"
          fontSize="22" fontWeight="bold" fill={color}
        >
          {score}
        </text>
      </svg>
      <span className="text-sm text-gray-500 font-medium">Overall Score</span>
    </div>
  )
}
