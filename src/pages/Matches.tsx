import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { MatchCard } from '../components/cards/MatchCard'
import { PageHeader } from '../components/ui/PageHeader'
import { formatPrice } from '../lib/utils'
import { useApp } from '../store/AppContext'

export function Matches() {
  const { getAllMatches } = useApp()
  const allMatches = useMemo(() => getAllMatches(), [getAllMatches])
  const totalProspects = useMemo(
    () => allMatches.reduce((sum, item) => sum + item.matches.length, 0),
    [allMatches],
  )

  return (
    <div className="content-page space-y-5">
      <PageHeader
        eyebrow="Correspondances"
        title="Personnes à contacter"
        subtitle={
          totalProspects > 0
            ? `${totalProspects} prospect${totalProspects > 1 ? 's' : ''} identifié${totalProspects > 1 ? 's' : ''} sur ${allMatches.length} bien${allMatches.length > 1 ? 's' : ''}.`
            : 'Correspondances calculées entre vos biens disponibles et les recherches actives.'
        }
        icon={<Sparkles size={22} className="text-sky-300 hidden sm:block" />}
      />

      {allMatches.length === 0 ? (
        <div className="nemea-panel text-center py-12">
          <Sparkles size={36} className="mx-auto text-indigo-400/30" />
          <p className="mt-4 text-sm text-white/40">Aucune correspondance pour le moment.</p>
          <Link to="/biens" className="btn-ghost mt-3 inline-flex">Voir les biens</Link>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {allMatches.map(({ property, matches }) => (
            <section key={property.id} className="nemea-panel nemea-panel--glow">
              <Link to={`/biens/${property.id}`} className="match-section__property block mb-4 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold glow-text group-hover:text-indigo-200 transition-colors truncate">
                      {property.reference}
                    </h2>
                    <p className="text-xs text-white/35 mt-0.5">
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
    </div>
  )
}
