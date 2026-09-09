import { useId, useState } from 'react'
import {
  Check, AlertCircle, Sparkles, Mail, Phone, Calendar, User, Hash, MapPin, FileText,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  detectInputType, formatPhoneInput, formatSurfaceInput,
  getConfidenceLevel, isValidEmail, isValidPhone,
} from '../../lib/smart'

interface SmartFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  confidence?: number
  hint?: string
  placeholder?: string
  smartFormat?: boolean
  required?: boolean
  type?: 'text' | 'email' | 'tel' | 'date' | 'number'
  suffix?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal'
  className?: string
}

const TYPE_ICONS = {
  email: Mail,
  tel: Phone,
  date: Calendar,
  number: Hash,
  text: FileText,
}

const SMART_LABELS: Partial<Record<string, string>> = {
  email: 'Email détecté',
  tel: 'Tél. FR',
  date: 'Date',
  number: 'Nombre',
}

function pickIcon(label: string, detectedType: keyof typeof TYPE_ICONS) {
  const l = label.toLowerCase()
  if (l.includes('prénom') || l.includes('nom') || l.includes('name')) return User
  if (l.includes('ville') || l.includes('quartier') || l.includes('local')) return MapPin
  return TYPE_ICONS[detectedType] ?? FileText
}

export function SmartField({
  label, value, onChange, confidence, hint, placeholder, smartFormat = true, required,
  type, suffix, inputMode, className,
}: SmartFieldProps) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const [shake, setShake] = useState(false)
  const detectedType = type ?? detectInputType(value, label)
  const confLevel = getConfidenceLevel(confidence)
  const validation = detectedType === 'email' && value ? isValidEmail(value)
    : detectedType === 'tel' && value ? isValidPhone(value) : true
  const isComplete = value.length > 0 && validation
  const Icon = pickIcon(label, detectedType)
  const smartLabel = smartFormat && value.length > 2 ? SMART_LABELS[detectedType] : null
  const showHintBelow = hint && (value.length > 0 || focused)

  const handleChange = (raw: string) => {
    if (!smartFormat) { onChange(raw); return }
    if (detectedType === 'tel') onChange(formatPhoneInput(raw))
    else if (label.toLowerCase().includes('surface')) onChange(formatSurfaceInput(raw))
    else onChange(raw)
  }

  const handleBlur = () => {
    setFocused(false)
    if (value && !validation) {
      setShake(true)
      setTimeout(() => setShake(false), 450)
    }
  }

  return (
    <div className={cn('smart-field', className)}>
      <label htmlFor={id} className="smart-field__label">
        {label}{required && <span className="smart-field__required"> *</span>}
      </label>

      <div className={cn(
        'smart-input-shell',
        focused && 'smart-input-shell--focused',
        isComplete && 'smart-input-shell--valid',
        !validation && value && 'smart-input-shell--invalid',
        shake && 'smart-input-shell--shake',
      )}>
        <div className="smart-input-shell__icon" aria-hidden>
          <Icon size={16} strokeWidth={1.75} />
        </div>

        <input
          id={id}
          type={detectedType === 'number' ? 'text' : detectedType}
          inputMode={inputMode ?? (detectedType === 'tel' ? 'tel' : detectedType === 'email' ? 'email' : detectedType === 'number' ? 'numeric' : 'text')}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder ?? (focused ? undefined : hint)}
          className={cn(
            'smart-input-control smart-input-control--static',
            detectedType === 'number' && 'tabular-nums',
          )}
          aria-invalid={!validation && value ? true : undefined}
        />

        <div className="smart-input-shell__status">
          {smartLabel && focused && (
            <span className="smart-type-badge">{smartLabel}</span>
          )}
          {confidence !== undefined ? (
            confLevel === 'high' ? <Check size={15} className="text-emerald-400" />
              : confLevel === 'medium' ? <Sparkles size={15} className="text-indigo-300 smart-icon-pulse" />
              : <AlertCircle size={15} className="text-red-400" />
          ) : isComplete ? (
            <Check size={15} className="text-emerald-400 smart-icon-pop" />
          ) : suffix ? (
            <span className="text-xs text-white/30">{suffix}</span>
          ) : null}
        </div>

        <div className="smart-input-shell__line" aria-hidden />
      </div>

      {(showHintBelow || smartLabel || (!validation && value)) && (
        <p className={cn('smart-input-hint', !validation && value && 'smart-input-hint--error')}>
          {!validation && value
            ? 'Format invalide. Vérifiez la saisie.'
            : showHintBelow
              ? hint
              : smartLabel && !focused
                ? `Champ reconnu : ${smartLabel.toLowerCase()}`
                : undefined}
        </p>
      )}
    </div>
  )
}
