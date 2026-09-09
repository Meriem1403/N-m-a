import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PropertyCard } from '../components/cards/PropertyCard'
import { FilterChips } from '../components/ui/FilterChips'
import { ListSelect, ListSort, ListToolbar, ListToolbarSelects } from '../components/ui/ListToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SmartSearch } from '../components/ui/SmartSearch'
import { usePagination } from '../hooks/usePagination'
import { statusLabels } from '../lib/utils'
import type { PropertyStatus, PropertyType } from '../types'
import { useApp } from '../store/AppContext'

type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'match'

const PAGE_SIZE = 8

export function Properties() {
  const { properties, getAllMatches } = useApp()
  const allMatches = getAllMatches()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('recent')

  const cities = useMemo(
    () => [...new Set(properties.map((p) => p.city))].sort((a, b) => a.localeCompare(b, 'fr')),
    [properties],
  )
  const types = useMemo(
    () => [...new Set(properties.map((p) => p.type))].sort(),
    [properties],
  )

  const filtered = useMemo(() => {
    let list = [...properties]

    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter)
    if (cityFilter !== 'all') list = list.filter((p) => p.city === cityFilter)
    if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter)

    const q = query.toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q),
      )
    }

    const matchScore = (id: string) => allMatches.find((m) => m.property.id === id)?.matches[0]?.score ?? 0

    list.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'match') return matchScore(b.id) - matchScore(a.id)
      return b.createdAt.localeCompare(a.createdAt)
    })

    return list
  }, [properties, query, statusFilter, cityFilter, typeFilter, sort, allMatches])

  const pagination = usePagination(filtered, PAGE_SIZE, [query, statusFilter, cityFilter, typeFilter, sort])
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

      <SmartSearch value={query} onChange={setQuery} placeholder="Référence, ville, type…" resultCount={filtered.length} />

      <ListToolbar>
        <FilterChips
          value={statusFilter}
          onChange={setStatusFilter}
          ariaLabel="Filtrer par statut"
          options={[
            { value: 'all', label: 'Tous' },
            ...Object.entries(statusLabels).map(([value, label]) => ({
              value: value as PropertyStatus,
              label,
            })),
          ]}
        />
        <ListToolbarSelects>
          <ListSelect
            value={cityFilter}
            onChange={setCityFilter}
            ariaLabel="Filtrer par ville"
            options={[
              { value: 'all', label: 'Toutes villes' },
              ...cities.map((city) => ({ value: city, label: city })),
            ]}
          />
          <ListSelect
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as PropertyType | 'all')}
            ariaLabel="Filtrer par type"
            options={[
              { value: 'all', label: 'Tous types' },
              ...types.map((type) => ({ value: type, label: type })),
            ]}
          />
          <ListSort
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: 'recent', label: 'Plus récents' },
              { value: 'match', label: 'Meilleurs matchs' },
              { value: 'price-asc', label: 'Prix croissant' },
              { value: 'price-desc', label: 'Prix décroissant' },
            ]}
          />
        </ListToolbarSelects>
      </ListToolbar>

      <div className="nemea-grid-cards">
        {pagination.paginated.map((property) => {
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

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        from={pagination.from}
        to={pagination.to}
        total={pagination.total}
        onPageChange={pagination.setPage}
      />
    </div>
  )
}
