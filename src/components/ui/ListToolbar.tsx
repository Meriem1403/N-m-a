import type { ReactNode } from 'react'
import { ListSelect } from './ListSelect'

interface ListToolbarProps {
  children: ReactNode
}

/** Barre filtres + tri — colonne sur mobile, ligne sur desktop */
export function ListToolbar({ children }: ListToolbarProps) {
  return <div className="list-toolbar">{children}</div>
}

/** Groupe les menus déroulants sur une grille responsive */
export function ListToolbarSelects({ children }: { children: ReactNode }) {
  return <div className="list-toolbar__selects">{children}</div>
}

interface ListSortProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label?: string
}

export function ListSort({ value, onChange, options, label = 'Trier par' }: ListSortProps) {
  return (
    <ListSelect
      value={value}
      onChange={onChange}
      options={options}
      ariaLabel={label}
    />
  )
}

// Re-export for pages
export { ListSelect } from './ListSelect'
