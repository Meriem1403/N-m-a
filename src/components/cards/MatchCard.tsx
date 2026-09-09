import { Link } from 'react-router-dom'
import { Building2, ChevronRight, User } from 'lucide-react'
import type { MatchResult, Property } from '../../types'
import { ScoreRing } from '../ui/ScoreRing'

interface MatchCardProps {
  match: MatchResult
  property?: Property
  rank?: number
  delay?: number
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="match-card__rank" aria-label={`Priorité ${rank}`}>
      <span className="match-card__rank-num">{rank}</span>
    </span>
  )
}

function MatchCriteriaSummary({ details }: { details: MatchResult['details'] }) {
  if (details.length === 0) return null

  const ok = details.filter((d) => d.status === 'match' || d.status === 'bonus').length
  const issues = details.filter((d) => d.status === 'miss' || d.status === 'partial')

  return (
    <div className="match-card__summary">
      <div className="match-card__meter" aria-hidden>
        {details.map((d, i) => (
          <span key={i} className={`match-card__meter-seg match-card__meter-seg--${d.status}`} />
        ))}
      </div>
      <p className="match-card__summary-text">
        <span className="match-card__summary-ok">{ok} sur {details.length} critères</span>
        {issues.length > 0 && (
          <span className="match-card__summary-issues">
            {' · '}{issues.map((d) => d.criterion.toLowerCase()).join(', ')}
          </span>
        )}
      </p>
    </div>
  )
}

export function MatchCard({ match, property, rank, delay = 0 }: MatchCardProps) {
  const { profile, score, details } = match
  const isTop = score >= 85

  return (
    <Link
      to={`/profils/${profile.id}`}
      className={`nemea-card nemea-card--link nemea-card--shine interactive-card match-card block ${isTop ? 'match-card--top' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`Voir le profil de ${profile.firstName} ${profile.lastName}, score ${score} pourcent`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {rank !== undefined && <RankBadge rank={rank} />}
        <ScoreRing score={score} size={50} strokeWidth={3} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-semibold text-white truncate flex items-center gap-1.5">
              <User size={14} className="flex-shrink-0 opacity-50" aria-hidden />
              {profile.firstName} {profile.lastName}
            </p>
            <ChevronRight size={16} className="text-white/25 flex-shrink-0 mt-0.5 match-card__chevron" aria-hidden />
          </div>
          <p className="text-xs text-white/40 mt-0.5 truncate">{match.search.label}</p>
          {property && (
            <p className="mt-1 text-xs text-white/35 flex items-center gap-1 truncate">
              <Building2 size={12} className="flex-shrink-0 opacity-60" aria-hidden />
              {property.reference} · {property.type}
            </p>
          )}
          <MatchCriteriaSummary details={details} />
        </div>
      </div>
    </Link>
  )
}
