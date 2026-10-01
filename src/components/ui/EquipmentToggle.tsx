type EquipmentToggleProps = {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  activeScale?: boolean
}

export function EquipmentToggle({ label, checked, onChange, activeScale }: EquipmentToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
        checked
          ? `border-indigo-400/30 bg-indigo-500/10 text-indigo-200${activeScale ? ' scale-[1.01]' : ''}`
          : 'border-white/8 bg-white/3 text-nemea-muted hover:border-white/12'
      }`}
    >
      <span>{label}</span>
      <span
        className={`relative inline-flex h-5 w-10 shrink-0 overflow-hidden rounded-full transition-colors ${
          checked ? 'bg-indigo-500' : 'bg-white/15'
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left] duration-200 ease-out ${
            checked ? 'left-[calc(100%-1rem-0.125rem)]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}
