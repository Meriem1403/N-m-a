import { Link } from 'react-router-dom'
import { Building2, Check, ChevronRight, Minus, Sparkles, User, X } from 'lucide-react'
import type { MatchDetail, MatchResult, Property } from '../../types'
import { ScoreRing } from '../ui/ScoreRing'

interface MatchCardProps {
  match: MatchResult
  property?: Property
  rank?: number
  delay?: number
  /** Désactivé par défaut sur les listes longues (perf mobile) */
  animateScore?: boolean
}

const STATUS_ORDER: Record<MatchDetail['status'], number> = {
  miss: 0,
  partial: 1,
  bonus: 2,
  match: 3,
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="match-card__rank" aria-label={`Priorité ${rank}`}>
      <span className="match-card__rank-num">{rank}</span>
    </span>
  )
}

function CriterionChip({ detail }: { detail: MatchDetail }) {
  const label = detail.criterion ?? 'Critère'
  const Icon =
    detail.status === 'match' ? Check
    : detail.status === 'bonus' ? Sparkles
    : detail.status === 'partial' ? Minus
    : X

  return (
    <span
      className={`match-criterion match-criterion--${detail.status}`}
      title={detail.message}
    >
      <Icon size={11} strokeWidth={2.25} aria-hidden />
      <span className="match-criterion__label">{label}</span>
    </span>
  )
}

function MatchCriteriaSummary({ details }: { details: MatchResult['details'] }) {
  if (details.length === 0) return null

  const sorted = [...details].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  )
  const ok = details.filter((d) => d.status === 'match' || d.status === 'bonus').length
  const gaps = details.length - ok

  return (
    <div className="match-card__criteria">
      <div className="match-card__criteria-head">
        <span className="match-card__criteria-stat match-card__criteria-stat--ok">
          {ok} OK
        </span>
        {gaps > 0 && (
          <span className="match-card__criteria-stat match-card__criteria-stat--gap">
            {gaps} écart{gaps > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="match-card__criteria-chips" aria-label="Critères de correspondance">
        {sorted.map((d) => (
          <CriterionChip key={`${d.criterion}-${d.status}-${d.message}`} detail={d} />
        ))}
      </div>
    </div>
  )
}

export function MatchCard({ match, property, rank, delay = 0, animateScore = false }: MatchCardProps) {
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
        <ScoreRing score={score} size={50} strokeWidth={3} animate={animateScore} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-semibold text-white truncate flex items-center gap-1.5">
              <User size={14} className="flex-shrink-0 opacity-50" aria-hidden />
              {profile.firstName} {profile.lastName}
            </p>
            <ChevronRight size={16} className="text-white/25 flex-shrink-0 mt-0.5 match-card__chevron" aria-hidden />
          </div>
          <p className="text-xs text-nemea-subtle mt-0.5 truncate">{match.search.label}</p>
          {property && (
            <p className="mt-1 text-xs text-nemea-subtle flex items-center gap-1 truncate">
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
