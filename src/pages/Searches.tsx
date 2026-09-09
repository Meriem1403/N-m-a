import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { SearchCard } from '../components/cards/SearchCard'
import { FilterChips } from '../components/ui/FilterChips'
import { ListSelect, ListSort, ListToolbar, ListToolbarSelects } from '../components/ui/ListToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SmartSearch } from '../components/ui/SmartSearch'
import { usePagination } from '../hooks/usePagination'
import { useApp } from '../store/AppContext'

type ActiveFilter = 'all' | 'active' | 'inactive'
type SortKey = 'recent' | 'match' | 'label'

const PAGE_SIZE = 6

export function Searches() {
  const { searches, profiles, getMatchesForSearch } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ActiveFilter>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('recent')

  const cities = useMemo(
    () => [...new Set(searches.flatMap((s) => s.criteria.cities))].sort((a, b) => a.localeCompare(b, 'fr')),
    [searches],
  )

  const filtered = useMemo(() => {
    let list = [...searches]

    if (filter === 'active') list = list.filter((s) => s.active)
    if (filter === 'inactive') list = list.filter((s) => !s.active)
    if (cityFilter !== 'all') list = list.filter((s) => s.criteria.cities.includes(cityFilter))

    const q = query.toLowerCase()
    if (q) {
      list = list.filter((s) => {
        const profile = profiles.find((p) => p.id === s.profileId)
        return (
          s.label.toLowerCase().includes(q) ||
          profile?.firstName.toLowerCase().includes(q) ||
          profile?.lastName.toLowerCase().includes(q) ||
          s.criteria.cities.some((c) => c.toLowerCase().includes(q))
        )
      })
    }

    const topScore = (id: string) => getMatchesForSearch(id)[0]?.match.score ?? 0

    list.sort((a, b) => {
      if (sort === 'match') return topScore(b.id) - topScore(a.id)
      if (sort === 'label') return a.label.localeCompare(b.label, 'fr')
      return b.createdAt.localeCompare(a.createdAt)
    })

    return list
  }, [searches, profiles, query, filter, cityFilter, sort, getMatchesForSearch])

  const pagination = usePagination(filtered, PAGE_SIZE, [query, filter, cityFilter, sort])
  const activeCount = searches.filter((s) => s.active).length

  return (
    <div className="space-y-5 sm:space-y-6 nemea-page content-page">
      <PageHeader
        eyebrow="Recherches"
        title={`${activeCount} active${activeCount > 1 ? 's' : ''} sur ${searches.length}`}
        subtitle="Chaque recherche est comparée automatiquement avec vos biens disponibles."
        action={<Link to="/recherches/nouveau" className="btn-primary !text-xs sm:!text-sm"><Plus size={16} /> Nouvelle</Link>}
      />

      <SmartSearch value={query} onChange={setQuery} placeholder="Libellé, prospect, ville…" resultCount={filtered.length} />

      <ListToolbar>
        <FilterChips
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrer par statut"
          options={[
            { value: 'all', label: 'Toutes' },
            { value: 'active', label: 'Actives' },
            { value: 'inactive', label: 'Inactives' },
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
          <ListSort
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: 'recent', label: 'Plus récentes' },
              { value: 'match', label: 'Meilleur match' },
              { value: 'label', label: 'Libellé A → Z' },
            ]}
          />
        </ListToolbarSelects>
      </ListToolbar>

      <div className="responsive-stack">
        {pagination.paginated.map((search, i) => {
          const profile = profiles.find((p) => p.id === search.profileId)
          const matches = getMatchesForSearch(search.id)
          return <SearchCard key={search.id} search={search} profile={profile} topMatchScore={matches[0]?.match.score} delay={i * 40} />
        })}
        {filtered.length === 0 && (
          <div className="nemea-panel text-center py-12">
            <p className="text-sm text-nemea-subtle">Aucune recherche trouvée.</p>
            <Link to="/recherches/nouveau" className="btn-ghost mt-3 inline-flex">Créer une recherche</Link>
          </div>
        )}
      </div>

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
