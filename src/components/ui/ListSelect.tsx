import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ListSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  ariaLabel: string
  className?: string
}

export function ListSelect({ value, onChange, options, ariaLabel, className }: ListSelectProps) {
  return (
    <div className={cn('nemea-select-wrap', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="nemea-select nemea-input"
        aria-label={ariaLabel}
      >
        {options.map(({ value: v, label }) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      <ChevronDown className="nemea-select-chevron" size={16} strokeWidth={2} aria-hidden />
    </div>
  )
}
