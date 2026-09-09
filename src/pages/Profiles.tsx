import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ProfileCard } from '../components/cards/ProfileCard'
import { FilterChips } from '../components/ui/FilterChips'
import { ListSelect, ListSort, ListToolbar, ListToolbarSelects } from '../components/ui/ListToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SmartSearch } from '../components/ui/SmartSearch'
import { usePagination } from '../hooks/usePagination'
import { sourceLabels } from '../lib/utils'
import type { ContactSource } from '../types'
import { useApp } from '../store/AppContext'

type SearchFilter = 'all' | 'with' | 'without'
type SortKey = 'recent' | 'name' | 'contact'

const PAGE_SIZE = 6

export function Profiles() {
  const { profiles, searches } = useApp()
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<ContactSource | 'all'>('all')
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all')
  const [sort, setSort] = useState<SortKey>('recent')

  const filtered = useMemo(() => {
    let list = [...profiles]

    if (sourceFilter !== 'all') list = list.filter((p) => p.source === sourceFilter)
    if (searchFilter === 'with') list = list.filter((p) => searches.some((s) => s.profileId === p.id))
    if (searchFilter === 'without') list = list.filter((p) => !searches.some((s) => s.profileId === p.id))

    const q = query.toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.includes(q),
      )
    }

    list.sort((a, b) => {
      if (sort === 'name') return a.lastName.localeCompare(b.lastName, 'fr') || a.firstName.localeCompare(b.firstName, 'fr')
      if (sort === 'contact') return b.firstContactDate.localeCompare(a.firstContactDate)
      return b.createdAt.localeCompare(a.createdAt)
    })

    return list
  }, [profiles, searches, query, sourceFilter, searchFilter, sort])

  const pagination = usePagination(filtered, PAGE_SIZE, [query, sourceFilter, searchFilter, sort])

  return (
    <div className="content-page space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Profils"
        title={`${profiles.length} prospect${profiles.length > 1 ? 's' : ''}`}
        subtitle="Créez une fiche par personne contactée, avec ses recherches immobilières."
        action={
          <Link to="/profils/nouveau" className="btn-primary !text-xs sm:!text-sm w-full sm:w-auto justify-center">
            <Plus size={16} aria-hidden /> Nouveau profil
          </Link>
        }
      />

      <SmartSearch
        value={query}
        onChange={setQuery}
        placeholder="Nom, email, téléphone…"
        resultCount={filtered.length}
      />

      <ListToolbar>
        <FilterChips
          value={searchFilter}
          onChange={setSearchFilter}
          ariaLabel="Filtrer par recherches"
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'with', label: 'Avec recherche' },
            { value: 'without', label: 'Sans recherche' },
          ]}
        />
        <ListToolbarSelects>
          <ListSelect
            value={sourceFilter}
            onChange={(v) => setSourceFilter(v as ContactSource | 'all')}
            ariaLabel="Filtrer par source"
            options={[
              { value: 'all', label: 'Toutes sources' },
              ...Object.entries(sourceLabels).map(([v, l]) => ({ value: v, label: l })),
            ]}
          />
          <ListSort
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: 'recent', label: 'Plus récents' },
              { value: 'contact', label: 'Contact récent' },
              { value: 'name', label: 'Nom A → Z' },
            ]}
          />
        </ListToolbarSelects>
      </ListToolbar>

      <div className="responsive-stack">
        {pagination.paginated.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            searchCount={searches.filter((s) => s.profileId === profile.id).length}
          />
        ))}
        {filtered.length === 0 && (
          <div className="nemea-panel text-center py-12">
            <p className="text-sm text-nemea-subtle">Aucun profil trouvé.</p>
            {!query && sourceFilter === 'all' && searchFilter === 'all' && (
              <Link to="/profils/nouveau" className="btn-primary mt-4 inline-flex">
                <Plus size={16} /> Créer un profil
              </Link>
            )}
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
