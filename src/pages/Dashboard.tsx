import { Sparkles, Users, Building2, TrendingUp } from 'lucide-react'
import { MatchCard } from '../components/cards/MatchCard'
import { PropertyCard } from '../components/cards/PropertyCard'
import { DashboardHero } from '../components/ui/DashboardHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatCard } from '../components/ui/StatCard'
import { useApp } from '../store/AppContext'

export function Dashboard() {
  const { profiles, properties, getAllMatches } = useApp()
  const allMatches = getAllMatches()
  const totalMatches = allMatches.reduce((sum, m) => sum + m.matches.length, 0)
  const topMatches = allMatches.flatMap((m) => m.matches.slice(0, 1).map((match) => ({ match, property: m.property }))).slice(0, 3)
  const avgScore = totalMatches > 0
    ? Math.round(allMatches.reduce((s, m) => s + (m.matches[0]?.score ?? 0), 0) / allMatches.length)
    : 0

  return (
    <div className="content-page space-y-6 sm:space-y-8">
      <Reveal>
        <DashboardHero matchCount={totalMatches} profileCount={profiles.length} />
      </Reveal>

      <div className="nemea-stats">
        <Reveal delay={80}><StatCard label="Profils" value={profiles.length} icon={Users} tone="indigo" delay={50} /></Reveal>
        <Reveal delay={120}><StatCard label="Biens actifs" value={properties.filter((p) => p.status === 'disponible').length} icon={Building2} tone="cyan" delay={100} /></Reveal>
        <Reveal delay={160}><StatCard label="Correspondances" value={totalMatches} icon={Sparkles} tone="violet" delay={150} /></Reveal>
        <Reveal delay={200}><StatCard label="Taux moyen" value={totalMatches > 0 ? `${avgScore}%` : '—'} icon={TrendingUp} tone="green" delay={200} animate={totalMatches > 0} /></Reveal>
      </div>

      {topMatches.length > 0 && (
        <Reveal delay={100}>
          <section className="nemea-panel nemea-panel--glow">
            <SectionHeader title="Personnes à contacter" href="/correspondances" />
            <div className="space-y-3">
              {topMatches.map(({ match, property }, i) => (
                <MatchCard key={`${match.profileId}-${match.searchId}`} match={match} property={property} rank={i + 1} delay={i * 80} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <section>
        <Reveal>
          <SectionHeader title="Biens récents" href="/biens" />
        </Reveal>
        <div className="nemea-grid-cards">
          {properties.slice(0, 4).map((property, i) => {
            const matches = allMatches.find((m) => m.property.id === property.id)
            return (
              <Reveal key={property.id} delay={i * 70}>
                <PropertyCard
                  property={property}
                  topMatchScore={matches?.matches[0]?.score}
                  matchCount={matches?.matches.length}
                />
              </Reveal>
            )
          })}
        </div>
      </section>
    </div>
  )
}
