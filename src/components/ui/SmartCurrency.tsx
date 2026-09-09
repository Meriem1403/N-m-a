import { useId, useState } from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatBudgetDisplay, formatCurrencyInput, parseBudgetInput } from '../../lib/smart'

interface SmartCurrencyProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  placeholder?: string
  required?: boolean
}

function budgetTier(amount: number): { label: string; icon: typeof Sparkles } | null {
  if (amount >= 500000) return { label: 'Premium', icon: Sparkles }
  if (amount >= 250000) return { label: 'Confort', icon: TrendingUp }
  return null
}

export function SmartCurrency({ label, value, onChange, hint, placeholder, required }: SmartCurrencyProps) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const parsed = parseBudgetInput(value)
  const tier = parsed ? budgetTier(parsed) : null
  const TierIcon = tier?.icon

  return (
    <div className="smart-field">
      <label htmlFor={id} className="smart-field__label">
        {label}{required && <span className="smart-field__required"> *</span>}
      </label>

      <div className={cn(
        'smart-input-shell smart-input-shell--currency',
        focused && 'smart-input-shell--focused',
        parsed != null && parsed > 0 && 'smart-input-shell--valid',
      )}>
        <div className="smart-input-shell__icon smart-input-shell__icon--currency" aria-hidden>€</div>

        <input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? hint}
          className="smart-input-control smart-input-control--static tabular-nums"
        />

        <div className="smart-input-shell__status">
          {tier && TierIcon && (
            <span className="smart-type-badge smart-type-badge--tier">
              <TierIcon size={10} /> {tier.label}
            </span>
          )}
        </div>

        <div className="smart-input-shell__line" aria-hidden />
      </div>

      {parsed && (
        <p className="smart-input-hint smart-input-hint--live">
          <span className="smart-currency-live">{formatBudgetDisplay(parsed)} €</span>
          {hint && <span className="smart-input-hint__sep">{hint}</span>}
        </p>
      )}
    </div>
  )
}
