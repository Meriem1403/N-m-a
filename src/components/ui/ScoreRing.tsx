import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  animate?: boolean
}

export function ScoreRing({ score, size = 56, strokeWidth = 3, animate = true }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayScore / 100) * circumference
  const color = score >= 90 ? '#6b9e78' : score >= 70 ? '#c8b896' : score >= 50 ? '#a8a8b0' : '#c97a7a'
  const isHigh = score >= 85

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplayScore(score)
      return
    }

    const duration = 1400
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4)
      setDisplayScore(Math.round(score * eased))
      if (t < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [score, animate])

  return (
    <div
      className={`score-ring ${isHigh ? 'score-ring--high' : ''}`}
      style={{ width: size, height: size }}
    >
      {isHigh && <div className="score-ring__pulse" aria-hidden />}
      <svg width={size} height={size} className="score-ring__svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring__progress"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
      <span className="score-ring__value tabular-nums" style={{ color }}>{displayScore}%</span>
    </div>
  )
}
