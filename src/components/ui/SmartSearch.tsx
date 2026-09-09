import { Search, X } from 'lucide-react'

interface SmartSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
}

export function SmartSearch({ value, onChange, placeholder, resultCount }: SmartSearchProps) {
  return (
    <div className="smart-search animate-fade-up stagger-1">
      <div className="smart-search__shell">
        <Search size={18} className="smart-search__icon" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="smart-search__input"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} className="smart-search__clear" aria-label="Effacer">
            <X size={16} />
          </button>
        )}
      </div>
      {value && resultCount !== undefined && (
        <p className="smart-search__count">
          <span className="text-indigo-300 font-semibold">{resultCount}</span>
          {' '}résultat{resultCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
