import type { CriterionLevel } from '../../types'
import { criterionLabels } from '../../lib/utils'

const levels: CriterionLevel[] = ['required', 'wanted', 'indifferent', 'refused']

interface SmartCriterionProps {
  label: string
  value: CriterionLevel
  onChange: (level: CriterionLevel) => void
}

export function SmartCriterion({ label, value, onChange }: SmartCriterionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
      <span className="text-sm text-white/70 sm:w-28 flex-shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all active:scale-95 ${
              value === level
                ? 'border-indigo-400/35 bg-indigo-500/15 text-indigo-200'
                : 'border-white/14 bg-black/25 text-nemea-muted hover:border-indigo-400/30 hover:text-nemea-text'
            }`}
          >
            {criterionLabels[level]}
          </button>
        ))}
      </div>
    </div>
  )
}
