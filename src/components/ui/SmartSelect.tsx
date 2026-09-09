import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SmartSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function SmartSelect({ label, value, onChange, options }: SmartSelectProps) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className="smart-field">
      <label htmlFor={id} className="smart-field__label">{label}</label>
      <div className={cn('smart-input-shell smart-input-shell--select', focused && 'smart-input-shell--focused')}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="smart-select-control"
          aria-label={selected?.label ?? label}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className={cn('smart-select-chevron', focused && 'smart-select-chevron--open')} aria-hidden />
        <div className="smart-input-shell__line" aria-hidden />
      </div>
    </div>
  )
}
