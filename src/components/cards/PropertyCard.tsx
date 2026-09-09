import { ChevronRight, MapPin, Maximize } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Property } from '../../types'
import { formatPrice, statusColors, statusLabels } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { PropertyImage } from '../ui/PropertyImage'
import { ScoreRing } from '../ui/ScoreRing'

interface PropertyCardProps {
  property: Property
  topMatchScore?: number
  matchCount?: number
  delay?: number
}

export function PropertyCard({ property, topMatchScore, matchCount }: PropertyCardProps) {
  return (
    <Link
      to={`/biens/${property.id}`}
      className="nemea-card nemea-card--link nemea-card--shine interactive-card property-card block overflow-hidden p-0 w-full min-w-0"
      aria-label={`Bien ${property.reference}, ${formatPrice(property.price)}`}
    >
      <div className="property-card__media relative">
        <PropertyImage property={property} aspect="card" />
        <div className="property-card__overlay" aria-hidden />
        <div className="absolute top-3 left-3 z-10">
          <Badge className={statusColors[property.status]}>{statusLabels[property.status]}</Badge>
        </div>
        {topMatchScore !== undefined && topMatchScore > 0 && (
          <div className="absolute top-3 right-3 z-10" aria-label={`Score de correspondance ${topMatchScore} pourcent`}>
            <ScoreRing score={topMatchScore} size={40} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-nemea-subtle)] tracking-wide uppercase">{property.reference}</p>
            <h3 className="mt-0.5 text-lg sm:text-xl font-semibold text-white tabular-nums">{formatPrice(property.price)}</h3>
          </div>
          <ChevronRight size={16} className="text-white/40 mt-2 flex-shrink-0 property-card__arrow" aria-hidden />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Badge variant="accent">{property.type}</Badge>
          <Badge variant="muted"><MapPin size={10} className="mr-1 inline" aria-hidden />{property.city} {property.district?.replace(' arrondissement', '')}</Badge>
          <Badge variant="muted"><Maximize size={10} className="mr-1 inline" aria-hidden />{property.surface} m²</Badge>
        </div>
        {matchCount !== undefined && matchCount > 0 && (
          <p className="mt-3 text-sm font-medium text-indigo-200 property-card__match-hint">{matchCount} personne{matchCount > 1 ? 's' : ''} à contacter</p>
        )}
      </div>
    </Link>
  )
}
