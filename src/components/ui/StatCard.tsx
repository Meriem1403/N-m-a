import type { LucideIcon } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'indigo' | 'cyan' | 'violet' | 'green'
  delay?: number
  animate?: boolean
}

const iconTone = {
  indigo: 'nemea-stat-icon nemea-stat-icon--glow',
  cyan: 'nemea-stat-icon nemea-stat-icon--cyan nemea-stat-icon--glow',
  violet: 'nemea-stat-icon nemea-stat-icon--violet nemea-stat-icon--glow',
  green: 'nemea-stat-icon nemea-stat-icon--green nemea-stat-icon--glow',
}

export function StatCard({ label, value, icon: Icon, tone = 'indigo', delay = 0, animate = true }: StatCardProps) {
  const numeric = typeof value === 'number'
  const parsed = typeof value === 'string' && value.endsWith('%')
    ? parseInt(value, 10)
    : null

  return (
    <div className="nemea-stat-card nemea-stat-card--shine" style={{ animationDelay: `${delay}ms` }}>
      <div className={iconTone[tone]}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div>
        <span className="nemea-stat-value">
          {animate && numeric ? (
            <AnimatedNumber value={value as number} />
          ) : animate && parsed !== null && !isNaN(parsed) ? (
            <AnimatedNumber value={parsed} suffix="%" />
          ) : (
            value
          )}
        </span>
        <span className="nemea-stat-label">{label}</span>
      </div>
    </div>
  )
}
