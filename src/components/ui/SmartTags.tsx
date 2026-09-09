import { useId, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { suggestDistricts } from '../../lib/smart'

interface SmartTagsProps {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export function SmartTags({ label, tags, onChange, suggestions, placeholder = 'Ajouter…' }: SmartTagsProps) {
  const id = useId()
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const hints = suggestions ?? suggestDistricts(input, tags)

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed])
    setInput('')
  }

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag))

  return (
    <div>
      <label htmlFor={id} className="section-label block mb-2">{label}</label>
      <div className={`rounded-xl border transition-colors ${focused ? 'border-indigo-400/40 bg-white/[0.03]' : 'border-white/8 bg-white/[0.02]'}`}>
        <div className="flex flex-wrap gap-1.5 p-2.5">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/15 border border-indigo-400/25 px-2 py-1 text-xs text-indigo-200">
              {tag.replace(' arrondissement', '')}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
            </span>
          ))}
          <input
            id={id}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) { e.preventDefault(); addTag(input) }
              if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1])
            }}
            placeholder={tags.length ? '' : placeholder}
            className="flex-1 min-w-[120px] bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-white/25"
          />
        </div>
        {focused && hints.length > 0 && (
          <div className="border-t border-white/6 p-1.5 flex flex-wrap gap-1">
            {hints.map((hint) => (
              <button
                key={hint}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(hint)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-white/50 hover:bg-white/6 hover:text-white/80"
              >
                <Plus size={10} />{hint.replace(' arrondissement', '')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
