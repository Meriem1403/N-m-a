import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { SearchCard } from '../components/cards/SearchCard'
import { PageHeader } from '../components/ui/PageHeader'
import { SmartSearch } from '../components/ui/SmartSearch'
import { useApp } from '../store/AppContext'

export function Searches() {
  const { searches, profiles, getMatchesForSearch } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = useMemo(() => {
    let list = searches
    if (filter === 'active') list = list.filter((s) => s.active)
    if (filter === 'inactive') list = list.filter((s) => !s.active)
    const q = query.toLowerCase()
    if (!q) return list
    return list.filter((s) => {
      const profile = profiles.find((p) => p.id === s.profileId)
      return (
        s.label.toLowerCase().includes(q) ||
        profile?.firstName.toLowerCase().includes(q) ||
        profile?.lastName.toLowerCase().includes(q) ||
        s.criteria.cities.some((c) => c.toLowerCase().includes(q))
      )
    })
  }, [searches, profiles, query, filter])

  const activeCount = searches.filter((s) => s.active).length

  return (
    <div className="space-y-5 sm:space-y-6 nemea-page content-page">
      <PageHeader
        eyebrow="Recherches"
        title={`${activeCount} active${activeCount > 1 ? 's' : ''} sur ${searches.length}`}
        subtitle="Chaque recherche est comparée automatiquement avec vos biens disponibles."
        action={<Link to="/recherches/nouveau" className="btn-primary !text-xs sm:!text-sm"><Plus size={16} /> Nouvelle</Link>}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SmartSearch value={query} onChange={setQuery} placeholder="Libellé, prospect, ville…" resultCount={query ? filtered.length : undefined} />
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-medium border transition-all ${
                filter === f ? 'border-indigo-400/35 bg-indigo-500/15 text-indigo-200' : 'border-white/8 text-white/40 hover:text-white/70'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : 'Inactives'}
            </button>
          ))}
        </div>
      </div>

      <div className="responsive-stack">
        {filtered.map((search, i) => {
          const profile = profiles.find((p) => p.id === search.profileId)
          const matches = getMatchesForSearch(search.id)
          return <SearchCard key={search.id} search={search} profile={profile} topMatchScore={matches[0]?.match.score} delay={i * 40} />
        })}
        {filtered.length === 0 && (
          <div className="nemea-panel text-center py-12">
            <p className="text-sm text-white/40">Aucune recherche trouvée.</p>
            <Link to="/recherches/nouveau" className="btn-ghost mt-3 inline-flex">Créer une recherche</Link>
          </div>
        )}
      </div>
    </div>
  )
}
