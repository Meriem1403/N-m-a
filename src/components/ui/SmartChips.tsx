import { cn } from '../../lib/utils'

interface SmartChipsProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (selected: T[]) => void
  multi?: boolean
}

export function SmartChips<T extends string>({ label, options, selected, onChange, multi = true }: SmartChipsProps<T>) {
  const toggle = (value: T) => {
    if (multi) {
      onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
    } else {
      onChange(selected.includes(value) ? [] : [value])
    }
  }

  return (
    <div>
      <p className="section-label mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-all active:scale-95',
                active
                  ? 'border-indigo-400/35 bg-indigo-500/15 text-indigo-200 shadow-[0_0_12px_rgba(124,127,245,0.15)]'
                  : 'border-white/8 bg-white/3 text-white/40 hover:border-indigo-400/25 hover:text-white/70',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
