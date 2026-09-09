import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { MatchCard } from '../components/cards/MatchCard'
import { PageHeader } from '../components/ui/PageHeader'
import { Reveal } from '../components/ui/Reveal'
import { formatPrice } from '../lib/utils'
import { useApp } from '../store/AppContext'

export function Matches() {
  const { getAllMatches } = useApp()
  const allMatches = getAllMatches()

  return (
    <div className="content-page space-y-5">
      <Reveal>
        <PageHeader
          eyebrow="Correspondances"
          title="Personnes à contacter"
          subtitle="Correspondances calculées entre vos biens disponibles et les recherches actives."
          icon={<Sparkles size={22} className="text-sky-300 hidden sm:block animate-pulse-soft" />}
        />
      </Reveal>

      {allMatches.length === 0 ? (
        <div className="nemea-panel text-center py-12">
          <Sparkles size={36} className="mx-auto text-indigo-400/30" />
          <p className="mt-4 text-sm text-white/40">Aucune correspondance pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {allMatches.map(({ property, matches }, si) => (
            <Reveal key={property.id} delay={si * 80}>
            <section className="nemea-panel nemea-panel--glow">
              <Link to={`/biens/${property.id}`} className="match-section__property block mb-4 group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold glow-text group-hover:text-indigo-200 transition-colors">{property.reference}</h2>
                    <p className="text-xs text-white/35 mt-0.5">{property.type} · {formatPrice(property.price)} · {property.surface} m²</p>
                  </div>
                  <span className="match-section__count tabular-nums">
                    {matches.length} prospect{matches.length > 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
              <div className="space-y-3">
                {matches.map((m, i) => (
                  <MatchCard key={`${m.profileId}-${m.searchId}`} match={m} property={property} rank={i + 1} delay={i * 40} />
                ))}
              </div>
            </section>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
