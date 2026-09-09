import { useEffect, useRef, useState } from 'react'
import { Sparkles, ScanLine } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SmartTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minRows?: number
  label?: string
  showStats?: boolean
}

export function SmartTextarea({ value, onChange, placeholder, minRows = 4, label, showStats = false }: SmartTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)
  const [scanning, setScanning] = useState(false)
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const charCount = value.length

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, minRows * 26)}px`
  }, [value, minRows])

  const handlePaste = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 1400)
  }

  return (
    <div className="smart-field">
      {label && <label className="section-label block mb-2">{label}</label>}
      <div className={cn(
        'smart-textarea-wrap',
        focused && 'smart-textarea-wrap--focused',
        scanning && 'smart-textarea-wrap--scanning',
      )}>
        {scanning && (
          <div className="smart-textarea-scan" aria-live="polite">
            <ScanLine size={14} className="smart-icon-pulse" />
            Analyse intelligente…
          </div>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={minRows}
          className="smart-textarea-control"
        />
        <div className="smart-textarea-footer">
          {showStats && (
            <span className="smart-textarea-stats">{wordCount} mot{wordCount > 1 ? 's' : ''} · {charCount} car.</span>
          )}
          {value.length > 20 && !scanning && (
            <span className="smart-textarea-ready"><Sparkles size={12} /> Prêt à analyser</span>
          )}
        </div>
        <div className="smart-input-shell__line" aria-hidden />
      </div>
    </div>
  )
}
