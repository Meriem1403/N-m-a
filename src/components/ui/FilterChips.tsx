interface FilterChipsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  ariaLabel?: string
}

export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  ariaLabel = 'Filtres',
}: FilterChipsProps<T>) {
  return (
    <div className="filter-chips" role="group" aria-label={ariaLabel}>
      {options.map(({ value: v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`filter-chip ${value === v ? 'filter-chip--active' : ''}`}
          aria-pressed={value === v}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
