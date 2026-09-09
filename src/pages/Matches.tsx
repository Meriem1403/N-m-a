import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { MatchCard } from '../components/cards/MatchCard'
import { FilterChips } from '../components/ui/FilterChips'
import { ListSort, ListToolbar, ListToolbarSelects } from '../components/ui/ListToolbar'
import { PageHeader } from '../components/ui/PageHeader'
import { Pagination } from '../components/ui/Pagination'
import { SmartSearch } from '../components/ui/SmartSearch'
import { usePagination } from '../hooks/usePagination'
import { formatPrice } from '../lib/utils'
import { useApp } from '../store/AppContext'

type ScoreFilter = 'all' | '70' | '85'
type SortKey = 'score' | 'prospects' | 'recent'

const PAGE_SIZE = 4

export function Matches() {
  const { getAllMatches } = useApp()
  const [query, setQuery] = useState('')
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all')
  const [sort, setSort] = useState<SortKey>('score')

  const filtered = useMemo(() => {
    let list = getAllMatches().map(({ property, matches }) => {
      const minScore = scoreFilter === 'all' ? 0 : Number(scoreFilter)
      const filteredMatches = matches.filter((m) => m.score >= minScore)
      return { property, matches: filteredMatches }
    }).filter(({ matches }) => matches.length > 0)

    const q = query.toLowerCase()
    if (q) {
      list = list.filter(
        ({ property }) =>
          property.reference.toLowerCase().includes(q) ||
          property.city.toLowerCase().includes(q) ||
          property.type.toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => {
      if (sort === 'prospects') return b.matches.length - a.matches.length
      if (sort === 'recent') return b.property.createdAt.localeCompare(a.property.createdAt)
      return (b.matches[0]?.score ?? 0) - (a.matches[0]?.score ?? 0)
    })

    return list
  }, [getAllMatches, query, scoreFilter, sort])

  const pagination = usePagination(filtered, PAGE_SIZE, [query, scoreFilter, sort])
  const totalProspects = useMemo(
    () => filtered.reduce((sum, item) => sum + item.matches.length, 0),
    [filtered],
  )

  return (
    <div className="content-page space-y-5">
      <PageHeader
        eyebrow="Correspondances"
        title="Personnes à contacter"
        subtitle={
          totalProspects > 0
            ? `${totalProspects} prospect${totalProspects > 1 ? 's' : ''} sur ${filtered.length} bien${filtered.length > 1 ? 's' : ''}.`
            : 'Correspondances calculées entre vos biens disponibles et les recherches actives.'
        }
        icon={<Sparkles size={22} className="text-sky-300 hidden sm:block" />}
      />

      <SmartSearch value={query} onChange={setQuery} placeholder="Référence bien, ville, type…" resultCount={filtered.length} />

      <ListToolbar>
        <FilterChips
          value={scoreFilter}
          onChange={setScoreFilter}
          ariaLabel="Filtrer par score minimum"
          options={[
            { value: 'all', label: 'Tous scores' },
            { value: '70', label: '≥ 70 %' },
            { value: '85', label: '≥ 85 %' },
          ]}
        />
        <ListToolbarSelects>
          <ListSort
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: 'score', label: 'Meilleur score' },
              { value: 'prospects', label: 'Plus de prospects' },
              { value: 'recent', label: 'Biens récents' },
            ]}
          />
        </ListToolbarSelects>
      </ListToolbar>

      {filtered.length === 0 ? (
        <div className="nemea-panel text-center py-12">
          <Sparkles size={36} className="mx-auto text-indigo-400/30" />
          <p className="mt-4 text-sm text-nemea-subtle">Aucune correspondance pour le moment.</p>
          <Link to="/biens" className="btn-ghost mt-3 inline-flex">Voir les biens</Link>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {pagination.paginated.map(({ property, matches }) => (
            <section key={property.id} className="nemea-panel nemea-panel--glow">
              <Link to={`/biens/${property.id}`} className="match-section__property block mb-4 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold glow-text group-hover:text-indigo-200 transition-colors truncate">
                      {property.reference}
                    </h2>
                    <p className="text-xs text-nemea-subtle mt-0.5">
                      {property.type} · {formatPrice(property.price)} · {property.surface} m²
                    </p>
                  </div>
                  <span className="match-section__count tabular-nums">
                    {matches.length} prospect{matches.length > 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
              <div className="space-y-3">
                {matches.map((m, i) => (
                  <MatchCard
                    key={`${property.id}-${m.profileId}-${m.searchId}`}
                    match={m}
                    property={property}
                    rank={i + 1}
                  />
                ))}
              </div>
            </section>
          ))}
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
