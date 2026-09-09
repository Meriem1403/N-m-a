import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PropertyCard } from '../components/cards/PropertyCard'
import { PageHeader } from '../components/ui/PageHeader'
import { SmartSearch } from '../components/ui/SmartSearch'
import { statusLabels } from '../lib/utils'
import type { PropertyStatus } from '../types'
import { useApp } from '../store/AppContext'

export function Properties() {
  const { properties, getAllMatches } = useApp()
  const allMatches = getAllMatches()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all')

  const filtered = useMemo(() => {
    let list = properties
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter)
    const q = query.toLowerCase()
    if (!q) return list
    return list.filter(
      (p) =>
        p.reference.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q),
    )
  }, [properties, query, statusFilter])

  const disponibleCount = properties.filter((p) => p.status === 'disponible').length

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0 content-page">
      <PageHeader
        eyebrow="Biens"
        title={`${disponibleCount} disponible${disponibleCount > 1 ? 's' : ''} sur ${properties.length}`}
        subtitle="Filtrez par statut ou recherchez par référence, quartier ou type."
        action={
          <Link to="/biens/nouveau" className="btn-primary text-sm w-full sm:w-auto justify-center">
            <Plus size={16} aria-hidden /> Nouveau bien
          </Link>
        }
      />

      <div className="flex flex-col gap-3 w-full">
        <SmartSearch value={query} onChange={setQuery} placeholder="Référence, ville, type…" resultCount={query ? filtered.length : undefined} />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}
          className="nemea-input min-h-[48px] cursor-pointer text-sm w-full"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous statuts</option>
          {Object.entries(statusLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="nemea-grid-cards">
        {filtered.map((property) => {
          const matches = allMatches.find((m) => m.property.id === property.id)
          return (
            <PropertyCard
              key={property.id}
              property={property}
              topMatchScore={matches?.matches[0]?.score}
              matchCount={matches?.matches.length}
            />
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="nemea-panel text-center py-12"><p className="text-sm text-[var(--color-nemea-muted)]">Aucun bien trouvé.</p></div>
      )}
    </div>
  )
}
