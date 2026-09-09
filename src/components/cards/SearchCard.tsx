import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Euro, Maximize } from 'lucide-react'
import type { Profile, Search } from '../../types'
import { criterionLabels, formatPrice, formatShortDate } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { ScoreRing } from '../ui/ScoreRing'

interface SearchCardProps {
  search: Search
  profile?: Profile
  topMatchScore?: number
  delay?: number
}

export function SearchCard({ search, profile, topMatchScore, delay = 0 }: SearchCardProps) {
  const c = search.criteria
  const activeCriteria = [
    c.terrace.level !== 'indifferent' && `Terrasse ${criterionLabels[c.terrace.level]}`,
    c.parking.level !== 'indifferent' && `Parking ${criterionLabels[c.parking.level]}`,
    c.view.level !== 'indifferent' && `Vue ${criterionLabels[c.view.level]}`,
  ].filter(Boolean)

  return (
    <Link
      to={`/recherches/${search.id}`}
      className="nemea-card nemea-card--link interactive-card animate-fade-up block"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        {topMatchScore !== undefined && (
          <div className="flex-shrink-0 hidden sm:block">
            <ScoreRing score={topMatchScore} size={44} strokeWidth={3} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white truncate">{search.label}</h3>
              {profile && (
                <p className="text-sm text-nemea-subtle mt-0.5 truncate">
                  {profile.firstName} {profile.lastName}
                  <span className="text-white/20 mx-1.5" aria-hidden>·</span>
                  <span className="text-nemea-label">Créée {formatShortDate(search.createdAt)}</span>
                </p>
              )}
              {!profile && (
                <p className="text-xs text-nemea-label mt-0.5">Créée {formatShortDate(search.createdAt)}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {topMatchScore !== undefined && (
                <span className="sm:hidden text-xs font-bold text-indigo-300 tabular-nums">{topMatchScore}%</span>
              )}
              <Badge variant={search.active ? 'success' : 'muted'}>{search.active ? 'Active' : 'Inactive'}</Badge>
              <ChevronRight size={16} className="text-white/20 hidden sm:block" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.propertyTypes.slice(0, 4).map((t) => <Badge key={t} variant="accent">{t}</Badge>)}
            {c.cities[0] && (
              <Badge variant="muted">
                <MapPin size={10} className="mr-1 inline" />
                {c.cities[0]}{c.districts.length > 0 && ` · ${c.districts.length} zone${c.districts.length > 1 ? 's' : ''}`}
              </Badge>
            )}
            {c.budgetMax && <Badge variant="muted"><Euro size={10} className="mr-1 inline" />max {formatPrice(c.budgetMax)}</Badge>}
            {c.surfaceMin && <Badge variant="muted"><Maximize size={10} className="mr-1 inline" />≥ {c.surfaceMin} m²</Badge>}
          </div>
          {activeCriteria.length > 0 && (
            <p className="mt-3 pt-3 border-t border-white/6 text-xs text-nemea-subtle line-clamp-2">{activeCriteria.join(' · ')}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
