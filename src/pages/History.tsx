import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, History as HistoryIcon } from 'lucide-react'
import { ListSort, ListToolbar, ListToolbarSelects } from '../components/ui/ListToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SmartSearch } from '../components/ui/SmartSearch'
import { usePagination } from '../hooks/usePagination'
import { formatDate, formatPrice } from '../lib/utils'
import { useApp } from '../store/AppContext'

type SortKey = 'recent' | 'oldest' | 'name'

const PAGE_SIZE = 8

export function History() {
  const { getAllHistory } = useApp()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')

  const filtered = useMemo(() => {
    let list = getAllHistory()

    const q = query.toLowerCase()
    if (q) {
      list = list.filter(
        ({ profile, search, entry }) =>
          profile.firstName.toLowerCase().includes(q) ||
          profile.lastName.toLowerCase().includes(q) ||
          search.label.toLowerCase().includes(q) ||
          entry.note?.toLowerCase().includes(q),
      )
    }

    list = [...list].sort((a, b) => {
      if (sort === 'name') {
        return a.profile.lastName.localeCompare(b.profile.lastName, 'fr')
          || a.profile.firstName.localeCompare(b.profile.firstName, 'fr')
      }
      if (sort === 'oldest') return a.entry.date.localeCompare(b.entry.date)
      return b.entry.date.localeCompare(a.entry.date)
    })

    return list
  }, [getAllHistory, query, sort])

  const pagination = usePagination(filtered, PAGE_SIZE, [query, sort])

  return (
    <div className="space-y-5 nemea-page content-page">
      <PageHeader
        eyebrow="Historique"
        title="Évolution des recherches"
        subtitle="Suivez l'évolution des critères et budgets au fil du temps."
        icon={<HistoryIcon size={22} className="text-violet-300 hidden sm:block" />}
      />

      <SmartSearch value={query} onChange={setQuery} placeholder="Nom, recherche, note…" resultCount={filtered.length} />

      <ListToolbar>
        <ListToolbarSelects>
          <ListSort
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: 'recent', label: 'Plus récent' },
              { value: 'oldest', label: 'Plus ancien' },
              { value: 'name', label: 'Nom A → Z' },
            ]}
          />
        </ListToolbarSelects>
      </ListToolbar>

      {filtered.length === 0 ? (
        <div className="nemea-panel text-center py-12"><p className="text-sm text-nemea-subtle">Aucun historique.</p></div>
      ) : (
        <div className="relative max-w-3xl">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/40 to-transparent hidden sm:block" />
          <div className="space-y-3">
            {pagination.paginated.map(({ profile, search, entry }, i) => (
              <Link
                key={entry.id}
                to={`/recherches/${search.id}`}
                className="relative block pl-0 sm:pl-10 animate-fade-up group"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full bg-indigo-400 border-2 border-[var(--color-nemea-bg)] shadow-[0_0_8px_rgba(129,140,248,0.5)] hidden sm:block" />
                <div className="nemea-card interactive-card group-hover:border-indigo-400/30">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-nemea-subtle">{formatDate(entry.date)}</p>
                      <h3 className="text-base font-semibold text-white truncate">{profile.firstName} {profile.lastName}</h3>
                      <p className="text-sm text-nemea-subtle truncate">{search.label}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-sky-300/60 group-hover:text-sky-300 flex-shrink-0 transition-colors" />
                  </div>
                  {entry.note && <p className="mt-2 text-sm text-nemea-subtle italic line-clamp-2">{entry.note}</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {entry.changes.budgetMax !== undefined && <span className="nemea-badge nemea-badge--accent">Budget: {formatPrice(entry.changes.budgetMax)}</span>}
                    {entry.changes.surfaceMin !== undefined && <span className="nemea-badge nemea-badge--accent">≥ {entry.changes.surfaceMin} m²</span>}
                    {entry.changes.propertyTypes && <span className="nemea-badge nemea-badge--muted">{entry.changes.propertyTypes.join('/')}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
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
